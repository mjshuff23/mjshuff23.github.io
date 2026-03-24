import { useEffect, useRef, useState } from "react";
import {
  ALIAS_STORAGE_KEY,
  type AliasDefinition,
  type AliasDraft,
  BUILT_IN_ALIASES,
  BUILT_IN_ALIAS_MAP,
  type CustomAlias,
  normalizeAliasKey,
  parseStoredAliases,
  splitAliasCommands,
} from "@/features/static-chaos/aliases";

export function useStaticChaosAliases() {
  const aliasMapRef = useRef<Map<string, AliasDefinition>>(BUILT_IN_ALIAS_MAP);
  const [customAliases, setCustomAliases] = useState<CustomAlias[]>([]);
  const [aliasDraft, setAliasDraft] = useState<AliasDraft>({ key: "", commands: "" });
  const [aliasFormMessage, setAliasFormMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedAliases = window.localStorage.getItem(ALIAS_STORAGE_KEY);
      if (!storedAliases) {
        return;
      }

      setCustomAliases(parseStoredAliases(JSON.parse(storedAliases)));
    } catch {
      setCustomAliases([]);
    }
  }, []);

  useEffect(() => {
    aliasMapRef.current = new Map(BUILT_IN_ALIASES.map((alias) => [alias.key, alias] as const));

    for (const alias of customAliases) {
      aliasMapRef.current.set(alias.key, {
        ...alias,
        description: "Custom browser-side alias.",
      });
    }

    try {
      window.localStorage.setItem(ALIAS_STORAGE_KEY, JSON.stringify(customAliases));
    } catch {
      // Ignore storage failures and keep the in-memory aliases usable.
    }
  }, [customAliases]);

  const saveAlias = () => {
    const key = normalizeAliasKey(aliasDraft.key);
    const commands = aliasDraft.commands.trim();

    if (!key) {
      setAliasFormMessage("Alias names cannot be empty.");
      return false;
    }

    if (/\s/.test(key)) {
      setAliasFormMessage("Alias names must be a single token with no spaces.");
      return false;
    }

    if (BUILT_IN_ALIAS_MAP.has(key)) {
      setAliasFormMessage(`'${key}' is reserved by a built-in alias.`);
      return false;
    }

    if (splitAliasCommands(commands).length === 0) {
      setAliasFormMessage("Enter at least one command to save the alias.");
      return false;
    }

    setCustomAliases((current) =>
      [...current.filter((alias) => alias.key !== key), { key, commands }].sort((left, right) =>
        left.key.localeCompare(right.key),
      ),
    );
    setAliasDraft({ key: "", commands: "" });
    setAliasFormMessage(`Saved alias '${key}'.`);
    return true;
  };

  const removeAlias = (key: string) => {
    setCustomAliases((current) => current.filter((alias) => alias.key !== key));
    setAliasFormMessage(`Removed alias '${key}'.`);
  };

  return {
    aliasMapRef,
    customAliases,
    aliasDraft,
    setAliasDraft,
    aliasFormMessage,
    saveAlias,
    removeAlias,
  };
}
