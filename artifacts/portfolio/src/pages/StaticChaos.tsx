import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Github, RadioTower, RefreshCcw, TerminalSquare, Wifi, WifiOff } from "lucide-react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { parseTelnetChunk, writeLocalInput } from "@/lib/telnet";

const SOCKET_URL =
  import.meta.env.VITE_STATIC_CHAOS_WS_URL ?? "wss://humble-curiosity-production.up.railway.app/ws";
const RAW_TCP_HOST = "centerbeam.proxy.rlwy.net";
const RAW_TCP_PORT = "20711";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

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
  const terminalHostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const localEchoRef = useRef(true);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Live browser gateway online.");
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    const mountNode = terminalHostRef.current;
    if (!mountNode) {
      return;
    }

    mountNode.innerHTML = "";

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: false,
      scrollOnUserInput: true,
      fontFamily:
        '"Cascadia Mono", "Fira Code", "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
      fontSize: 13,
      lineHeight: 1.1,
      theme: {
        background: "#08131a",
        foreground: "#d7f5ef",
        cursor: "#48f0d2",
        selectionBackground: "rgba(72, 240, 210, 0.28)",
        black: "#0f1f26",
        brightBlack: "#35505a",
        red: "#ff6b6b",
        green: "#48f0d2",
        yellow: "#f7d774",
        blue: "#78c7ff",
        magenta: "#e79cff",
        cyan: "#63f2ff",
        white: "#f5fffd",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(mountNode);

    let viewportSyncTimer: number | null = null;

    const scheduleFit = () => {
      if (viewportSyncTimer !== null) {
        window.clearTimeout(viewportSyncTimer);
      }

      viewportSyncTimer = window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            fitAddon.fit();
            terminal.scrollToBottom();
          });
        });
      }, 32);
    };

    scheduleFit();
    terminal.focus();
    terminal.writeln("\x1b[36m[static-chaos]\x1b[0m Booting remote terminal...");
    terminal.writeln("");

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const connect = () => {
      const existingSocket = socketRef.current;
      if (existingSocket) {
        existingSocket.close();
      }

      setStatus("connecting");
      setStatusMessage("Opening WebSocket bridge to Railway gateway.");

      const socket = new WebSocket(SOCKET_URL);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
        setStatusMessage("Connected. Type directly into the terminal.");
        terminal.writeln("\x1b[32m[bridge]\x1b[0m Connected.\r\n");
        scheduleFit();
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          terminal.write(event.data);
          scheduleFit();
          return;
        }

        const chunk = new Uint8Array(event.data);
        const parsed = parseTelnetChunk(chunk);

        if (parsed.localEcho !== undefined) {
          localEchoRef.current = parsed.localEcho;
        }

        for (const response of parsed.responses) {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(response);
          }
        }

        if (parsed.text.length > 0) {
          const text = new TextDecoder().decode(parsed.text);
          terminal.write(text);
          scheduleFit();
        }
      };

      socket.onerror = () => {
        setStatus("error");
        setStatusMessage("WebSocket bridge failed. Retry or use the raw telnet endpoint.");
        terminal.writeln("\r\n\x1b[31m[bridge]\x1b[0m Connection error.\r\n");
      };

      socket.onclose = () => {
        setStatus((current) => (current === "error" ? "error" : "disconnected"));
        setStatusMessage("Session closed. Reconnect to start a fresh terminal.");
        terminal.writeln("\r\n\x1b[33m[bridge]\x1b[0m Session closed.\r\n");
      };

      const disposable = terminal.onData((value) => {
        if (socket.readyState === WebSocket.OPEN) {
          writeLocalInput((text) => terminal.write(text), value, localEchoRef.current);
          socket.send(value);
        }
      });

      return () => {
        disposable.dispose();
        socket.close();
      };
    };

    const disconnect = connect();

    const handleResize = () => {
      scheduleFit();
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleFit();
    });
    resizeObserver.observe(mountNode);

    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        scheduleFit();
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (viewportSyncTimer !== null) {
        window.clearTimeout(viewportSyncTimer);
      }
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      disconnect?.();
      socketRef.current = null;
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionKey]);

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
              <Link href="/">
                <a className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary">
                  <ArrowLeft className="h-4 w-4" />
                  Back To Portfolio
                </a>
              </Link>

              <div className="max-w-4xl space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill status={status} />
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                    Legacy C Runtime + WebSocket Conversion
                  </span>
                </div>

                <h1 className="max-w-4xl text-5xl font-display font-bold uppercase leading-[1.02] text-foreground md:text-7xl">
                  Static Chaos
                </h1>

                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  A live browser entry point into a classic MUD I brought forward with containerized deployment,
                  a Railway runtime, and a protocol bridge that converts raw TCP into a browser-safe WebSocket session.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-8 xl:grid-cols-[1.8fr_0.82fr]">
              <motion.section
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="overflow-hidden rounded-[28px] border border-primary/20 bg-[#071118] shadow-[0_0_0_1px_rgba(72,240,210,0.08),0_30px_90px_rgba(0,0,0,0.45)]"
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
                      onClick={() => setSessionKey((current) => current + 1)}
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

                <div className="relative min-h-[36rem] bg-[linear-gradient(180deg,rgba(72,240,210,0.03),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px] md:min-h-[40rem]">
                  <div ref={terminalHostRef} className="static-chaos-terminal h-[36rem] w-full p-3 md:h-[40rem] md:p-4" />
                </div>
              </motion.section>

              <motion.aside
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="space-y-6"
              >
                <section className="rounded-[24px] border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    What This Shows
                  </p>
                  <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <li>The backend remains a raw TCP service instead of pretending to be a web app.</li>
                    <li>A dedicated WebSocket gateway translates browser traffic without changing the game server.</li>
                    <li>The live page turns a portfolio case study into something recruiters can actually interact with.</li>
                  </ul>
                </section>

                <section className="rounded-[24px] border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    Connection Notes
                  </p>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                      <p className="mb-1 font-display text-base font-semibold uppercase text-foreground">
                        Browser Gateway
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
                        <Github className="h-4 w-4" />
                      </PremiumButton>
                    </a>
                    <Link href="/">
                      <a>
                        <PremiumButton className="w-full justify-between gap-2">
                          Return To Main Portfolio
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
