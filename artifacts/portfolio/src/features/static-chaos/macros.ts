import { splitAliasCommands } from "@/features/static-chaos/aliases";

export const MACRO_STORAGE_KEY = "static-chaos.macros.v1";

export const MACRO_BINDINGS = [
  "F2",
  "F3",
  "F4",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "Numpad0",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "Numpad7",
  "Numpad8",
  "Numpad9",
] as const;

export type MacroBinding = (typeof MACRO_BINDINGS)[number];

export type MacroDefinition = {
  key: string;
  name: string;
  binding: MacroBinding;
  commands: string;
  description: string;
  builtIn?: boolean;
  quickBar?: boolean;
};

export type CustomMacro = {
  key: string;
  name: string;
  binding: MacroBinding;
  commands: string;
  quickBar: boolean;
};

export type MacroDraft = {
  name: string;
  binding: MacroBinding;
  commands: string;
  quickBar: boolean;
};

const VALID_MACRO_BINDINGS = new Set<string>(MACRO_BINDINGS);

export const BUILT_IN_MACROS: MacroDefinition[] = [
  {
    key: "prep-macro",
    name: "Prep",
    binding: "F2",
    commands: "score; affects; equipment",
    description: "Quick status sweep before travel or combat.",
    builtIn: true,
    quickBar: true,
  },
  {
    key: "travel-macro",
    name: "Travel",
    binding: "F3",
    commands: "where; scan; exits",
    description: "Check surroundings, nearby targets, and exits in one pass.",
    builtIn: true,
    quickBar: true,
  },
  {
    key: "corpse-macro",
    name: "Corpse",
    binding: "F4",
    commands: "get all corpse",
    description: "Loot a corpse without typing the full command.",
    builtIn: true,
    quickBar: true,
  },
  {
    key: "cleanup-macro",
    name: "Cleanup",
    binding: "F6",
    commands: "get all corpse; look in corpse; sacrifice corpse",
    description: "Classic post-fight cleanup flow.",
    builtIn: true,
    quickBar: true,
  },
  {
    key: "panic-macro",
    name: "Panic",
    binding: "Numpad0",
    commands: "/",
    description: "Immediate recall shortcut.",
    builtIn: true,
    quickBar: true,
  },
  {
    key: "quiet-macro",
    name: "Quiet",
    binding: "Numpad1",
    commands:
      "channels -auction; channels -chat; channels -music; channels -question; channels -shout; channels -yell",
    description: "Reduce channel noise for focused play.",
    builtIn: true,
    quickBar: false,
  },
  {
    key: "loud-macro",
    name: "Loud",
    binding: "Numpad3",
    commands:
      "channels +auction; channels +chat; channels +music; channels +question; channels +shout; channels +yell",
    description: "Restore the common chatter channels.",
    builtIn: true,
    quickBar: false,
  },
];

export const BUILT_IN_MACRO_KEY_MAP = new Map(
  BUILT_IN_MACROS.map((macro) => [macro.key, macro] as const),
);

export const BUILT_IN_MACRO_BINDING_MAP = new Map(
  BUILT_IN_MACROS.map((macro) => [macro.binding, macro] as const),
);

export function createEmptyMacroDraft(): MacroDraft {
  return {
    name: "",
    binding: "F7",
    commands: "",
    quickBar: true,
  };
}

export function normalizeMacroKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeMacroBinding(value: string): MacroBinding | null {
  return VALID_MACRO_BINDINGS.has(value) ? (value as MacroBinding) : null;
}

export function formatMacroBinding(value: MacroBinding): string {
  return value.startsWith("Numpad")
    ? `Num ${value.slice("Numpad".length)}`
    : value;
}

export function parseStoredMacros(value: unknown): CustomMacro[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const macros = value
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const name = "name" in entry ? String(entry.name).trim() : "";
      const key = normalizeMacroKey("key" in entry ? String(entry.key) : name);
      const binding = normalizeMacroBinding(
        "binding" in entry ? String(entry.binding) : "",
      );
      const commands = "commands" in entry ? String(entry.commands).trim() : "";
      const quickBar = "quickBar" in entry ? Boolean(entry.quickBar) : true;

      if (
        !name ||
        !key ||
        !binding ||
        !commands ||
        BUILT_IN_MACRO_KEY_MAP.has(key) ||
        BUILT_IN_MACRO_BINDING_MAP.has(binding)
      ) {
        return [];
      }

      return [{ key, name, binding, commands, quickBar }];
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  return macros.filter(
    (macro, index) =>
      macros.findIndex(
        (candidate) =>
          candidate.key === macro.key || candidate.binding === macro.binding,
      ) === index,
  );
}

export function resolveMacroBinding(code: string): MacroBinding | null {
  return normalizeMacroBinding(code);
}

export function previewMacroCommands(commands: string): string {
  return splitAliasCommands(commands).join(" ; ");
}
