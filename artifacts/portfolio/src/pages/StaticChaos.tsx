import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BellRing, Command, ExternalLink, RadioTower, RefreshCcw, SquareCode, TerminalSquare, Wifi, WifiOff } from "lucide-react";
import "xterm/css/xterm.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AliasPanel } from "@/components/static-chaos/AliasPanel";
import { MacroPanel } from "@/components/static-chaos/MacroPanel";
import { MacroQuickBar } from "@/components/static-chaos/MacroQuickBar";
import { TriggerPanel } from "@/components/static-chaos/TriggerPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { BUILT_IN_ALIASES } from "@/features/static-chaos/aliases";
import { BUILT_IN_MACROS } from "@/features/static-chaos/macros";
import { BUILT_IN_TRIGGERS } from "@/features/static-chaos/triggers";
import { useStaticChaosAliases } from "@/hooks/use-static-chaos-aliases";
import { useStaticChaosMacros } from "@/hooks/use-static-chaos-macros";
import { useStaticChaosTriggers } from "@/hooks/use-static-chaos-triggers";
import {
  type ConnectionStatus,
  useStaticChaosTerminal,
} from "@/hooks/use-static-chaos-terminal";
import { cn } from "@/lib/utils";

const SOCKET_URL =
  import.meta.env.VITE_STATIC_CHAOS_WS_URL ?? "wss://humble-curiosity-production.up.railway.app/ws";
const RAW_TCP_HOST = "centerbeam.proxy.rlwy.net";
const RAW_TCP_PORT = "20711";

function StatusPill({ status }: { status: ConnectionStatus }) {
  const styles: Record<ConnectionStatus, string> = {
    idle: "border-border text-muted-foreground",
    connecting: "border-primary/40 text-primary",
    connected: "border-emerald-500/40 text-emerald-400",
    disconnected: "border-amber-500/40 text-amber-400",
    error: "border-destructive/40 text-destructive",
  };

  const labels: Record<ConnectionStatus, string> = {
    idle: "Idle",
    connecting: "Connecting",
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Connection Error",
  };

  const Icon = status === "connected" ? Wifi : status === "error" ? WifiOff : RadioTower;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]",
        styles[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {labels[status]}
    </div>
  );
}

export default function StaticChaos() {
  const [activePanel, setActivePanel] = useState<"aliases" | "macros" | "triggers" | null>(null);
  const {
    aliasMapRef,
    customAliases,
    aliasDraft,
    setAliasDraft,
    aliasFormMessage,
    saveAlias,
    removeAlias,
  } = useStaticChaosAliases();
  const {
    macroBindingsRef,
    customMacros,
    quickBarMacros,
    macroDraft,
    setMacroDraft,
    macroFormMessage,
    saveMacro,
    removeMacro,
  } = useStaticChaosMacros();
  const {
    triggerListRef,
    customTriggers,
    triggerDraft,
    setTriggerDraft,
    triggerFormMessage,
    saveTrigger,
    removeTrigger,
    toggleTrigger,
  } = useStaticChaosTriggers();
  const { terminalHostRef, status, statusMessage, reconnect, runMacro } = useStaticChaosTerminal({
    aliasMapRef,
    macroBindingsRef,
    triggerListRef,
    socketUrl: SOCKET_URL,
  });

  return (
    <div className="relative flex min-h-screen flex-col selection:bg-primary/30 selection:text-primary">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.10),transparent_28%)]" />

          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12 flex flex-col gap-6"
            >
              <Link href="/#projects" asChild>
                <a className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary">
                  <ArrowLeft className="h-4 w-4" />
                  Back To Projects
                </a>
              </Link>

              <div className="max-w-4xl space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill status={status} />
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                    C Runtime + TypeScript Translation Layer
                  </span>
                </div>

                <h1 className="max-w-4xl text-5xl font-display font-bold uppercase leading-[1.02] text-foreground md:text-7xl">
                  Static Chaos
                </h1>

                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  This project is how I study lower-level systems from a full-stack angle: reading a legacy C MUD,
                  wrapping pieces of it in TypeScript, and translating raw runtime behavior into abstractions I already
                  understand from modern web engineering.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-8 xl:grid-cols-[1.8fr_0.82fr] xl:items-start">
              <motion.section
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="self-start overflow-hidden rounded-[28px] border border-primary/20 bg-[#071118] shadow-[0_0_0_1px_rgba(72,240,210,0.08),0_30px_90px_rgba(0,0,0,0.45)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <TerminalSquare className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-display text-lg font-semibold uppercase text-foreground">
                        Live Terminal
                      </p>
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {statusMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanel((current) =>
                          current === "aliases" ? null : "aliases",
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                        activePanel === "aliases"
                          ? "border-primary/40 text-primary"
                          : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      <Command className="h-3.5 w-3.5" />
                      Alias Tools
                      <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground/80">
                        {BUILT_IN_ALIASES.length + customAliases.length} total
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanel((current) =>
                          current === "macros" ? null : "macros",
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                        activePanel === "macros"
                          ? "border-primary/40 text-primary"
                          : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      Macro Tools
                      <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground/80">
                        {BUILT_IN_MACROS.length + customMacros.length} total
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanel((current) =>
                          current === "triggers" ? null : "triggers",
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                        activePanel === "triggers"
                          ? "border-primary/40 text-primary"
                          : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      <BellRing className="h-3.5 w-3.5" />
                      Trigger Tools
                      <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground/80">
                        {BUILT_IN_TRIGGERS.length + customTriggers.length} total
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={reconnect}
                      className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Reconnect
                    </button>
                    <a href={`telnet://${RAW_TCP_HOST}:${RAW_TCP_PORT}`} className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                      Raw TCP
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="border-b border-white/10 bg-[#050d13] p-4">
                  <div className="rounded-[24px] border border-primary/20 bg-[#061019] shadow-[inset_0_1px_0_rgba(72,240,210,0.08),0_0_0_1px_rgba(72,240,210,0.04)]">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                          Game Feed
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Live MUD session output and input
                        </p>
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Runtime Surface
                      </div>
                    </div>

                    <div className="relative min-h-[34rem] overflow-hidden rounded-b-[24px] bg-[linear-gradient(180deg,rgba(72,240,210,0.03),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px] md:min-h-[38rem]">
                      <div className="h-[34rem] p-3 md:h-[38rem] md:p-4">
                        <div ref={terminalHostRef} className="static-chaos-terminal h-full w-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <MacroQuickBar macros={quickBarMacros} onRunMacro={runMacro} />

                {activePanel && (
                  <div className="border-t border-primary/10 bg-[linear-gradient(180deg,rgba(72,240,210,0.05),rgba(7,17,24,0.96))]">
                    <div className="px-5 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#08131a]/80 px-4 py-3">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                            Client Tools
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {activePanel === "aliases"
                              ? "Browser-side aliases and shorthand expansion"
                              : activePanel === "macros"
                                ? "Keyboard macros with mobile-friendly quick buttons"
                                : "Output triggers with local notes or command responses"}
                          </p>
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Separate From The Game Server
                        </div>
                      </div>
                    </div>

                    {activePanel === "aliases" ? (
                      <AliasPanel
                        builtInAliases={BUILT_IN_ALIASES}
                        customAliases={customAliases}
                        aliasDraft={aliasDraft}
                        aliasFormMessage={aliasFormMessage}
                        onDraftChange={setAliasDraft}
                        onSaveAlias={saveAlias}
                        onRemoveAlias={removeAlias}
                      />
                    ) : activePanel === "macros" ? (
                      <MacroPanel
                        builtInMacros={BUILT_IN_MACROS}
                        customMacros={customMacros}
                        macroDraft={macroDraft}
                        macroFormMessage={macroFormMessage}
                        onDraftChange={setMacroDraft}
                        onSaveMacro={saveMacro}
                        onRemoveMacro={removeMacro}
                        onRunMacro={runMacro}
                      />
                    ) : (
                      <TriggerPanel
                        builtInTriggers={BUILT_IN_TRIGGERS}
                        customTriggers={customTriggers}
                        triggerDraft={triggerDraft}
                        triggerFormMessage={triggerFormMessage}
                        onDraftChange={setTriggerDraft}
                        onSaveTrigger={saveTrigger}
                        onRemoveTrigger={removeTrigger}
                        onToggleTrigger={toggleTrigger}
                      />
                    )}
                  </div>
                )}
              </motion.section>

              <motion.aside
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="self-start space-y-6"
              >
                <section className="rounded-[24px] border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    Why This Project Exists
                  </p>
                  <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <li>I use the original C codebase to understand lower-level state, memory-oriented design, and tighter runtime constraints.</li>
                    <li>The TypeScript wrapper and browser gateway let me translate those ideas into abstractions I already know as a full-stack engineer.</li>
                    <li>The live demo is there to make that translation visible instead of keeping it as a private code-reading exercise.</li>
                  </ul>
                </section>

                <section className="rounded-[24px] border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    Translation Layers
                  </p>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                      <p className="mb-1 font-display text-base font-semibold uppercase text-foreground">
                        Legacy Core
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        The game server remains a C MUD with raw TCP semantics and its original runtime model.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-display text-base font-semibold uppercase text-foreground">
                        TypeScript Bridge
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        A TypeScript WebSocket gateway translates browser traffic without rewriting the underlying server.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-display text-base font-semibold uppercase text-foreground">
                        Browser Endpoint
                      </p>
                      <p className="break-all font-mono text-xs text-muted-foreground/90">
                        {SOCKET_URL}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-display text-base font-semibold uppercase text-foreground">
                        Raw Telnet
                      </p>
                      <p className="font-mono text-xs text-muted-foreground/90">
                        {RAW_TCP_HOST}:{RAW_TCP_PORT}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    Explore Further
                  </p>
                  <div className="space-y-3">
                    <a href="https://github.com/mjshuff23/staticchaos" target="_blank" rel="noreferrer">
                      <PremiumButton variant="outline" className="w-full justify-between gap-2">
                        Source Repository
                        <SquareCode className="h-4 w-4" />
                      </PremiumButton>
                    </a>
                    <Link href="/#projects" asChild>
                      <a>
                        <PremiumButton className="w-full justify-between gap-2">
                          Return To Projects
                          <ArrowRight className="h-4 w-4" />
                        </PremiumButton>
                      </a>
                    </Link>
                  </div>
                </section>
              </motion.aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
