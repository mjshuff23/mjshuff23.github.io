import { useEffect, useMemo, useRef, useState } from "react";
import {
  BUILT_IN_TRIGGERS,
  createEmptyTriggerDraft,
  type CustomTrigger,
  normalizeTriggerCooldown,
  normalizeTriggerKey,
  parseStoredTriggers,
  TRIGGER_STORAGE_KEY,
  type TriggerDefinition,
  type TriggerDraft,
} from "@/features/static-chaos/triggers";
import { splitAliasCommands } from "@/features/static-chaos/aliases";

export function useStaticChaosTriggers() {
  const triggerListRef = useRef<TriggerDefinition[]>(BUILT_IN_TRIGGERS);
  const [customTriggers, setCustomTriggers] = useState<CustomTrigger[]>([]);
  const [triggerDraft, setTriggerDraft] = useState<TriggerDraft>(createEmptyTriggerDraft());
  const [triggerFormMessage, setTriggerFormMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedTriggers = window.localStorage.getItem(TRIGGER_STORAGE_KEY);
      if (!storedTriggers) {
        return;
      }

      setCustomTriggers(parseStoredTriggers(JSON.parse(storedTriggers)));
    } catch {
      setCustomTriggers([]);
    }
  }, []);

  useEffect(() => {
    triggerListRef.current = [
      ...BUILT_IN_TRIGGERS,
      ...customTriggers.map((trigger) => ({
        ...trigger,
        description: "Custom browser-side trigger.",
      })),
    ];

    try {
      window.localStorage.setItem(TRIGGER_STORAGE_KEY, JSON.stringify(customTriggers));
    } catch {
      // Ignore storage failures and keep the in-memory triggers usable.
    }
  }, [customTriggers]);

  const allTriggers = useMemo<TriggerDefinition[]>(
    () => [
      ...BUILT_IN_TRIGGERS,
      ...customTriggers.map((trigger) => ({
        ...trigger,
        description: "Custom browser-side trigger.",
      })),
    ],
    [customTriggers],
  );

  const saveTrigger = () => {
    const name = triggerDraft.name.trim();
    const key = normalizeTriggerKey(name);
    const pattern = triggerDraft.pattern.trim();
    const cooldownMs = normalizeTriggerCooldown(triggerDraft.cooldownMs);

    if (!name || !key) {
      setTriggerFormMessage("Trigger names cannot be empty.");
      return false;
    }

    if (!pattern) {
      setTriggerFormMessage("Add a text pattern or regex to watch for.");
      return false;
    }

    if (
      triggerDraft.action === "send" &&
      splitAliasCommands(triggerDraft.commands).length === 0
    ) {
      setTriggerFormMessage("Send-command triggers need at least one command.");
      return false;
    }

    if (triggerDraft.matchMode === "regex") {
      try {
        new RegExp(pattern, "m");
      } catch {
        setTriggerFormMessage("That regex is invalid. Check the pattern and try again.");
        return false;
      }
    }

    setCustomTriggers((current) =>
      [
        ...current.filter((trigger) => trigger.key !== key),
        {
          key,
          name,
          pattern,
          matchMode: triggerDraft.matchMode,
          action: triggerDraft.action,
          commands: triggerDraft.commands.trim(),
          cooldownMs,
          enabled: triggerDraft.enabled,
        },
      ].sort((left, right) => left.name.localeCompare(right.name)),
    );
    setTriggerDraft(createEmptyTriggerDraft());
    setTriggerFormMessage(`Saved trigger '${name}'.`);
    return true;
  };

  const removeTrigger = (key: string) => {
    const removedTrigger = customTriggers.find((trigger) => trigger.key === key);
    setCustomTriggers((current) => current.filter((trigger) => trigger.key !== key));
    setTriggerFormMessage(
      removedTrigger ? `Removed trigger '${removedTrigger.name}'.` : "Removed trigger.",
    );
  };

  const toggleTrigger = (key: string) => {
    let nextEnabled = true;
    let nextName = key;

    setCustomTriggers((current) =>
      current.map((trigger) => {
        if (trigger.key !== key) {
          return trigger;
        }

        nextEnabled = !trigger.enabled;
        nextName = trigger.name;
        return {
          ...trigger,
          enabled: nextEnabled,
        };
      }),
    );

    setTriggerFormMessage(
      `${nextEnabled ? "Enabled" : "Disabled"} trigger '${nextName}'.`,
    );
  };

  return {
    triggerListRef,
    customTriggers,
    allTriggers,
    triggerDraft,
    setTriggerDraft,
    triggerFormMessage,
    saveTrigger,
    removeTrigger,
    toggleTrigger,
  };
}
