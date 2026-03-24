import { useEffect, useMemo, useRef, useState } from "react";
import { splitAliasCommands } from "@/features/static-chaos/aliases";
import {
  BUILT_IN_MACROS,
  BUILT_IN_MACRO_BINDING_MAP,
  BUILT_IN_MACRO_KEY_MAP,
  createEmptyMacroDraft,
  MACRO_STORAGE_KEY,
  type CustomMacro,
  type MacroDefinition,
  type MacroDraft,
  normalizeMacroBinding,
  normalizeMacroKey,
  parseStoredMacros,
} from "@/features/static-chaos/macros";

export function useStaticChaosMacros() {
  const macroBindingsRef = useRef<Map<string, MacroDefinition>>(
    BUILT_IN_MACRO_BINDING_MAP,
  );
  const [customMacros, setCustomMacros] = useState<CustomMacro[]>([]);
  const [macroDraft, setMacroDraft] = useState<MacroDraft>(createEmptyMacroDraft());
  const [macroFormMessage, setMacroFormMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedMacros = window.localStorage.getItem(MACRO_STORAGE_KEY);
      if (!storedMacros) {
        return;
      }

      setCustomMacros(parseStoredMacros(JSON.parse(storedMacros)));
    } catch {
      setCustomMacros([]);
    }
  }, []);

  useEffect(() => {
    macroBindingsRef.current = new Map(
      BUILT_IN_MACROS.map((macro) => [macro.binding, macro] as const),
    );

    for (const macro of customMacros) {
      macroBindingsRef.current.set(macro.binding, {
        ...macro,
        description: "Custom browser-side macro.",
      });
    }

    try {
      window.localStorage.setItem(MACRO_STORAGE_KEY, JSON.stringify(customMacros));
    } catch {
      // Ignore storage failures and keep the in-memory macros usable.
    }
  }, [customMacros]);

  const allMacros = useMemo<MacroDefinition[]>(
    () => [
      ...BUILT_IN_MACROS,
      ...customMacros.map((macro) => ({
        ...macro,
        description: "Custom browser-side macro.",
      })),
    ],
    [customMacros],
  );

  const quickBarMacros = useMemo(
    () => allMacros.filter((macro) => macro.quickBar),
    [allMacros],
  );

  const saveMacro = () => {
    const name = macroDraft.name.trim();
    const key = normalizeMacroKey(name);
    const binding = normalizeMacroBinding(macroDraft.binding);
    const commands = macroDraft.commands.trim();

    if (!name || !key) {
      setMacroFormMessage("Macro names cannot be empty.");
      return false;
    }

    if (!binding) {
      setMacroFormMessage("Choose a valid key binding.");
      return false;
    }

    if (BUILT_IN_MACRO_KEY_MAP.has(key)) {
      setMacroFormMessage(`'${name}' conflicts with a built-in macro name.`);
      return false;
    }

    if (BUILT_IN_MACRO_BINDING_MAP.has(binding)) {
      setMacroFormMessage(
        `${binding} is reserved by the built-in '${BUILT_IN_MACRO_BINDING_MAP.get(binding)?.name}' macro.`,
      );
      return false;
    }

    if (splitAliasCommands(commands).length === 0) {
      setMacroFormMessage("Enter at least one command to save the macro.");
      return false;
    }

    const conflictingMacro = customMacros.find(
      (macro) =>
        macro.binding === binding && macro.key !== key,
    );
    if (conflictingMacro) {
      setMacroFormMessage(
        `${binding} is already used by '${conflictingMacro.name}'. Delete it first or choose another key.`,
      );
      return false;
    }

    setCustomMacros((current) =>
      [
        ...current.filter(
          (macro) => macro.key !== key,
        ),
        {
          key,
          name,
          binding,
          commands,
          quickBar: macroDraft.quickBar,
        },
      ].sort((left, right) => left.name.localeCompare(right.name)),
    );
    setMacroDraft(createEmptyMacroDraft());
    setMacroFormMessage(`Saved macro '${name}'.`);
    return true;
  };

  const removeMacro = (key: string) => {
    const removedMacro = customMacros.find((macro) => macro.key === key);
    setCustomMacros((current) => current.filter((macro) => macro.key !== key));
    setMacroFormMessage(
      removedMacro ? `Removed macro '${removedMacro.name}'.` : "Removed macro.",
    );
  };

  return {
    macroBindingsRef,
    customMacros,
    allMacros,
    quickBarMacros,
    macroDraft,
    setMacroDraft,
    macroFormMessage,
    saveMacro,
    removeMacro,
  };
}
