import { splitAliasCommands } from "@/features/static-chaos/aliases";

export type TriggerMatchMode = "contains" | "regex";
export type TriggerAction = "note" | "send";

export type TriggerDefinition = {
  key: string;
  name: string;
  pattern: string;
  matchMode: TriggerMatchMode;
  action: TriggerAction;
  commands: string;
  cooldownMs: number;
  enabled: boolean;
  description: string;
  builtIn?: boolean;
};

export type CustomTrigger = {
  key: string;
  name: string;
  pattern: string;
  matchMode: TriggerMatchMode;
  action: TriggerAction;
  commands: string;
  cooldownMs: number;
  enabled: boolean;
};

export type TriggerDraft = {
  name: string;
  pattern: string;
  matchMode: TriggerMatchMode;
  action: TriggerAction;
  commands: string;
  cooldownMs: string;
  enabled: boolean;
};

export const TRIGGER_STORAGE_KEY = "static-chaos.triggers.v1";

export const BUILT_IN_TRIGGERS: TriggerDefinition[] = [];

export function createEmptyTriggerDraft(): TriggerDraft {
  return {
    name: "",
    pattern: "",
    matchMode: "contains",
    action: "note",
    commands: "",
    cooldownMs: "1500",
    enabled: true,
  };
}

export function normalizeTriggerKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTriggerCooldown(value: string | number): number {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    return 1500;
  }

  return Math.min(Math.max(parsed, 250), 60000);
}

export function parseStoredTriggers(value: unknown): CustomTrigger[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const triggers = value
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const name = "name" in entry ? String(entry.name).trim() : "";
      const key = normalizeTriggerKey("key" in entry ? String(entry.key) : name);
      const pattern = "pattern" in entry ? String(entry.pattern).trim() : "";
      const matchMode: TriggerMatchMode =
        "matchMode" in entry && entry.matchMode === "regex" ? "regex" : "contains";
      const action: TriggerAction =
        "action" in entry && entry.action === "send" ? "send" : "note";
      const commands = "commands" in entry ? String(entry.commands).trim() : "";
      const cooldownMs = normalizeTriggerCooldown(
        "cooldownMs" in entry ? String(entry.cooldownMs) : "1500",
      );
      const enabled = "enabled" in entry ? Boolean(entry.enabled) : true;

      if (!name || !key || !pattern) {
        return [];
      }

      if (action === "send" && splitAliasCommands(commands).length === 0) {
        return [];
      }

      if (matchMode === "regex") {
        try {
          new RegExp(pattern, "m");
        } catch {
          return [];
        }
      }

      return [{ key, name, pattern, matchMode, action, commands, cooldownMs, enabled }];
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  return triggers.filter(
    (trigger, index) =>
      triggers.findIndex((candidate) => candidate.key === trigger.key) === index,
  );
}

export function getTriggerPatternLabel(trigger: Pick<TriggerDefinition, "pattern" | "matchMode">): string {
  return trigger.matchMode === "regex"
    ? `/${trigger.pattern}/`
    : `"${trigger.pattern}"`;
}

export function previewTriggerCommands(commands: string): string {
  return splitAliasCommands(commands).join(" ; ");
}

export function doesTriggerMatch(
  trigger: Pick<TriggerDefinition, "pattern" | "matchMode">,
  input: string,
): boolean {
  if (!input || !trigger.pattern) {
    return false;
  }

  if (trigger.matchMode === "contains") {
    return input.includes(trigger.pattern);
  }

  try {
    return new RegExp(trigger.pattern, "m").test(input);
  } catch {
    return false;
  }
}
