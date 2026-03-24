import { type FormEvent } from "react";
import { Keyboard, Play, Plus, Trash2 } from "lucide-react";
import { splitAliasCommands } from "@/features/static-chaos/aliases";
import {
  type CustomMacro,
  formatMacroBinding,
  MACRO_BINDINGS,
  type MacroDefinition,
  type MacroDraft,
} from "@/features/static-chaos/macros";

type MacroPanelProps = {
  builtInMacros: MacroDefinition[];
  customMacros: CustomMacro[];
  macroDraft: MacroDraft;
  macroFormMessage: string | null;
  onDraftChange: (draft: MacroDraft) => void;
  onSaveMacro: () => void;
  onRemoveMacro: (key: string) => void;
  onRunMacro: (macro: MacroDefinition) => void;
};

export function MacroPanel({
  builtInMacros,
  customMacros,
  macroDraft,
  macroFormMessage,
  onDraftChange,
  onSaveMacro,
  onRemoveMacro,
  onRunMacro,
}: MacroPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSaveMacro();
  };

  return (
    <div className="m-4 mt-5 rounded-[24px] border border-primary/20 bg-[#09151c]/95 px-5 py-5 shadow-[0_0_0_1px_rgba(72,240,210,0.04),inset_0_1px_0_rgba(72,240,210,0.08)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold uppercase text-foreground">
            Client Macros
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Macros are browser-side shortcuts that fire one or more commands with a
            single key press or tap. Desktop players can use bound keys like function
            keys or the numpad, and the same macros can surface as mobile-friendly
            buttons in the quick bar.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          Keyboard on desktop, buttons on mobile
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Built-In Set
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {builtInMacros.map((macro) => (
                <div
                  key={macro.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-foreground">{macro.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                        {formatMacroBinding(macro.binding)}
                      </p>
                    </div>
                    <span className="rounded-full border border-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                      Built In
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {macro.description}
                  </p>
                  <code className="mb-3 block whitespace-pre-wrap break-words font-mono text-xs text-primary/90">
                    {splitAliasCommands(macro.commands).join("\n")}
                  </code>
                  <button
                    type="button"
                    onClick={() => onRunMacro(macro)}
                    className="inline-flex items-center gap-2 rounded-sm border border-primary/30 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run Macro
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Your Macros
            </p>
            {customMacros.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-muted-foreground">
                No custom macros saved yet. Create one on the right and it will
                persist in local storage for this browser.
              </div>
            ) : (
              <div className="space-y-3">
                {customMacros.map((macro) => (
                  <div
                    key={macro.key}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div>
                          <p className="font-mono text-sm text-foreground">{macro.name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                            {formatMacroBinding(macro.binding)}
                            {macro.quickBar ? " • Quick Bar" : " • Keyboard Only"}
                          </p>
                        </div>
                        <code className="block whitespace-pre-wrap break-words font-mono text-xs text-primary/90">
                          {splitAliasCommands(macro.commands).join("\n")}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onRunMacro({
                              ...macro,
                              description: "Custom browser-side macro.",
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-sm border border-primary/30 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Run
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveMacro(macro.key)}
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
            Create Macro
          </p>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            Pick a desktop key binding, define one or more commands, and decide if the
            macro should also appear as a tap target in the quick bar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Macro Name
              </span>
              <input
                value={macroDraft.name}
                onChange={(event) =>
                  onDraftChange({ ...macroDraft, name: event.target.value })
                }
                placeholder="Burst"
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
              />
            </label>

            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Key Binding
              </span>
              <div className="relative">
                <Keyboard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/80" />
                <select
                  value={macroDraft.binding}
                  onChange={(event) =>
                    onDraftChange({
                      ...macroDraft,
                      binding: event.target.value as MacroDraft["binding"],
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-background/80 py-3 pl-11 pr-4 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                >
                  {MACRO_BINDINGS.map((binding) => (
                    <option key={binding} value={binding}>
                      {formatMacroBinding(binding)}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Commands
              </span>
              <textarea
                value={macroDraft.commands}
                onChange={(event) =>
                  onDraftChange({ ...macroDraft, commands: event.target.value })
                }
                placeholder={"score\naffects\nequipment"}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40"
              />
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/60 px-4 py-3">
              <input
                type="checkbox"
                checked={macroDraft.quickBar}
                onChange={(event) =>
                  onDraftChange({ ...macroDraft, quickBar: event.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-white/20 bg-background text-primary"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                Show this macro in the quick bar so it can be tapped on mobile and
                clicked on desktop.
              </span>
            </label>

            <div className="rounded-xl border border-white/10 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="font-mono uppercase tracking-[0.16em] text-primary">
                Macro Notes
              </p>
              <p className="mt-2">
                Use one command per line if you want a clear readable sequence.
                Function keys and numpad bindings only fire while the terminal has
                focus, so editing forms here will not accidentally launch them.
              </p>
            </div>

            {macroFormMessage && (
              <p className="text-sm text-primary">{macroFormMessage}</p>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Save Macro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
