import { type FormEvent } from "react";
import { Plus, Power, Trash2, Zap } from "lucide-react";
import { splitAliasCommands } from "@/features/static-chaos/aliases";
import {
  getTriggerPatternLabel,
  type CustomTrigger,
  previewTriggerCommands,
  type TriggerDefinition,
  type TriggerDraft,
} from "@/features/static-chaos/triggers";

type TriggerPanelProps = {
  builtInTriggers: TriggerDefinition[];
  customTriggers: CustomTrigger[];
  triggerDraft: TriggerDraft;
  triggerFormMessage: string | null;
  onDraftChange: (draft: TriggerDraft) => void;
  onSaveTrigger: () => void;
  onRemoveTrigger: (key: string) => void;
  onToggleTrigger: (key: string) => void;
};

export function TriggerPanel({
  builtInTriggers,
  customTriggers,
  triggerDraft,
  triggerFormMessage,
  onDraftChange,
  onSaveTrigger,
  onRemoveTrigger,
  onToggleTrigger,
}: TriggerPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSaveTrigger();
  };

  return (
    <div className="m-4 mt-5 rounded-[24px] border border-primary/20 bg-[#09151c]/95 px-5 py-5 shadow-[0_0_0_1px_rgba(72,240,210,0.04),inset_0_1px_0_rgba(72,240,210,0.08)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold uppercase text-foreground">
            Client Triggers
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Triggers watch incoming MUD output and react when a pattern appears.
            This first pass keeps things bounded: match plain text or a regex, then
            either log a local note or send a command sequence with a cooldown.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          Output watch, local response
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {builtInTriggers.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                Built-In Set
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {builtInTriggers.map((trigger) => (
                  <div
                    key={trigger.key}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-foreground">{trigger.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                          {trigger.action === "send" ? "Send Commands" : "Local Note"} • {trigger.cooldownMs}ms cooldown
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                        Built In
                      </span>
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                      {trigger.description}
                    </p>
                    <code className="mb-2 block whitespace-pre-wrap break-words font-mono text-xs text-primary/90">
                      {getTriggerPatternLabel(trigger)}
                    </code>
                    {trigger.action === "send" && (
                      <code className="block whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                        {splitAliasCommands(trigger.commands).join("\n")}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Your Triggers
            </p>
            {customTriggers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-muted-foreground">
                No custom triggers saved yet. Create one on the right and it will
                persist in local storage for this browser.
              </div>
            ) : (
              <div className="space-y-3">
                {customTriggers.map((trigger) => (
                  <div
                    key={trigger.key}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div>
                          <p className="font-mono text-sm text-foreground">{trigger.name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                            {trigger.action === "send" ? "Send Commands" : "Local Note"} • {trigger.cooldownMs}ms cooldown • {trigger.enabled ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                        <code className="block whitespace-pre-wrap break-words font-mono text-xs text-primary/90">
                          {getTriggerPatternLabel(trigger)}
                        </code>
                        {trigger.action === "send" && (
                          <code className="block whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                            {previewTriggerCommands(trigger.commands)}
                          </code>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleTrigger(trigger.key)}
                          className="inline-flex items-center gap-2 rounded-sm border border-primary/30 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {trigger.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveTrigger(trigger.key)}
                          className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-1 font-display text-lg font-semibold uppercase text-foreground">
            Create Trigger
          </p>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            Match a phrase or regex from incoming output, then either log a local
            trigger event or automatically send commands back to the MUD.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Trigger Name
              </span>
              <input
                value={triggerDraft.name}
                onChange={(event) =>
                  onDraftChange({ ...triggerDraft, name: event.target.value })
                }
                placeholder="Corpse Notice"
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
              />
            </label>

            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Pattern
              </span>
              <input
                value={triggerDraft.pattern}
                onChange={(event) =>
                  onDraftChange({ ...triggerDraft, pattern: event.target.value })
                }
                placeholder="You are not affected by anything."
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  Match Type
                </span>
                <select
                  value={triggerDraft.matchMode}
                  onChange={(event) =>
                    onDraftChange({
                      ...triggerDraft,
                      matchMode: event.target.value as TriggerDraft["matchMode"],
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                >
                  <option value="contains">Contains Text</option>
                  <option value="regex">Regex</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  Action
                </span>
                <select
                  value={triggerDraft.action}
                  onChange={(event) =>
                    onDraftChange({
                      ...triggerDraft,
                      action: event.target.value as TriggerDraft["action"],
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                >
                  <option value="note">Local Note</option>
                  <option value="send">Send Commands</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Commands
              </span>
              <textarea
                value={triggerDraft.commands}
                onChange={(event) =>
                  onDraftChange({ ...triggerDraft, commands: event.target.value })
                }
                placeholder={"look\nscore"}
                rows={4}
                disabled={triggerDraft.action !== "send"}
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  Cooldown (ms)
                </span>
                <input
                  value={triggerDraft.cooldownMs}
                  onChange={(event) =>
                    onDraftChange({ ...triggerDraft, cooldownMs: event.target.value })
                  }
                  inputMode="numeric"
                  placeholder="1500"
                  className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={triggerDraft.enabled}
                  onChange={(event) =>
                    onDraftChange({ ...triggerDraft, enabled: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-background text-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Enabled
                </span>
              </label>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="font-mono uppercase tracking-[0.16em] text-primary">
                Trigger Notes
              </p>
              <p className="mt-2">
                Triggers only inspect incoming output from the game session. They do
                not parse the local alias or macro helper messages.
              </p>
              <p className="mt-2">
                Send-command triggers should use a cooldown to avoid loops. Start with
                plain text matches first, then move to regex only when you actually
                need it.
              </p>
            </div>

            {triggerFormMessage && (
              <p className="text-sm text-primary">{triggerFormMessage}</p>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Save Trigger
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-white/10 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-mono uppercase tracking-[0.16em] text-primary">
              Starter Ideas
            </p>
            <p className="mt-2">
              Match <code>You are not affected by anything.</code> and log a local
              note, or match <code>I see no corpse here.</code> and fire a recovery
              command sequence.
            </p>
            <p className="mt-2 inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Keep the first generation simple and visible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
