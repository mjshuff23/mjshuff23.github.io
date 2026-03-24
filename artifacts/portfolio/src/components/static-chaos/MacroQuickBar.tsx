import { Play, Smartphone } from "lucide-react";
import {
  type MacroDefinition,
  formatMacroBinding,
} from "@/features/static-chaos/macros";

type MacroQuickBarProps = {
  macros: MacroDefinition[];
  onRunMacro: (macro: MacroDefinition) => void;
};

export function MacroQuickBar({ macros, onRunMacro }: MacroQuickBarProps) {
  if (macros.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-white/10 bg-[#08121a]/90 px-5 py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              Quick Macros
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Tap here on mobile. Desktop uses the labeled key bindings.
            </p>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Client-side shortcuts
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {macros.map((macro) => (
          <button
            key={macro.key}
            type="button"
            onClick={() => onRunMacro(macro)}
            className="inline-flex items-center gap-2 rounded-sm border border-primary/25 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
          >
            <Play className="h-3.5 w-3.5" />
            {macro.name}
            <span className="text-[10px] text-muted-foreground">
              {formatMacroBinding(macro.binding)} key
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
