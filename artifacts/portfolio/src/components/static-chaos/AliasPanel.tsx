import { type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  type AliasDraft,
  type AliasDefinition,
  type CustomAlias,
  splitAliasCommands,
} from "@/features/static-chaos/aliases";

type AliasPanelProps = {
  builtInAliases: AliasDefinition[];
  customAliases: CustomAlias[];
  aliasDraft: AliasDraft;
  aliasFormMessage: string | null;
  onDraftChange: (draft: AliasDraft) => void;
  onSaveAlias: () => void;
  onRemoveAlias: (key: string) => void;
};

export function AliasPanel({
  builtInAliases,
  customAliases,
  aliasDraft,
  aliasFormMessage,
  onDraftChange,
  onSaveAlias,
  onRemoveAlias,
}: AliasPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSaveAlias();
  };

  return (
    <div className="m-4 mt-5 rounded-[24px] border border-primary/20 bg-[#09151c]/95 px-5 py-5 shadow-[0_0_0_1px_rgba(72,240,210,0.04),inset_0_1px_0_rgba(72,240,210,0.08)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold uppercase text-foreground">
            Client Aliases
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            These are browser-side quality-of-life shortcuts inspired by classic
            MUD clients. Built-ins help demonstrate the pattern, and custom aliases
            are stored locally in this browser. Use semicolons or new lines in the
            editor to define a sequence, and the client will send those commands one
            line at a time. Use <code>$*</code> inside a custom alias to forward the
            rest of the line.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          zMUD-style shorthand, local only
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Built-In Set
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {builtInAliases.map((alias) => (
                <div
                  key={alias.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <code className="font-mono text-sm text-foreground">{alias.key}</code>
                    <span className="rounded-full border border-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                      Built In
                    </span>
                  </div>
                  <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                    {alias.description}
                  </p>
                  <code className="block whitespace-pre-wrap break-words font-mono text-xs text-primary/90">
                    {splitAliasCommands(alias.commands).join("\n")}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Your Aliases
            </p>
            {customAliases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-muted-foreground">
                No custom aliases saved yet. Create one on the right and it will
                persist in local storage for this browser.
              </div>
            ) : (
              <div className="space-y-3">
                {customAliases.map((alias) => (
                  <div
                    key={alias.key}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="space-y-2">
                      <code className="font-mono text-sm text-foreground">{alias.key}</code>
                      <code className="block whitespace-pre-wrap break-words font-mono text-xs text-primary/90">
                        {splitAliasCommands(alias.commands).join("\n")}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAlias(alias.key)}
                      className="inline-flex items-center gap-2 self-start rounded-sm border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-1 font-display text-lg font-semibold uppercase text-foreground">
            Create Alias
          </p>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            Alias names are single tokens like <code>lootbag</code> or <code>burst</code>.
            Separate commands with semicolons or new lines. They are not sent as
            literal <code>;</code> characters to the MUD.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Alias Name
              </span>
              <input
                value={aliasDraft.key}
                onChange={(event) =>
                  onDraftChange({ ...aliasDraft, key: event.target.value })
                }
                placeholder="corpsebag"
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
              />
            </label>

            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Expansion
              </span>
              <textarea
                value={aliasDraft.commands}
                onChange={(event) =>
                  onDraftChange({ ...aliasDraft, commands: event.target.value })
                }
                placeholder={"score\naffects\nequipment"}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
              />
            </label>

            <div className="rounded-xl border border-white/10 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="font-mono uppercase tracking-[0.16em] text-primary">
                Template Hint
              </p>
              <p className="mt-2">
                Use <code>$*</code> to pass through the rest of the command line.
                Example: alias <code>gt</code> with <code>get $*</code>, then typing{" "}
                <code>gt sword</code> becomes <code>get sword</code>.
              </p>
              <p className="mt-2">
                For multi-step aliases, put each command on its own line. Example:
                <code className="ml-1 whitespace-pre-wrap">score{"\n"}affects{"\n"}equipment</code>
              </p>
            </div>

            {aliasFormMessage && (
              <p className="text-sm text-primary">{aliasFormMessage}</p>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Save Alias
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
