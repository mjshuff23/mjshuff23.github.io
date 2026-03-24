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

export type TriggerMatchResult = {
  captures: Record<string, string>;
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

function stripAnsiSequences(value: string): string {
  return value
    .replace(/\u001B\][^\u0007]*(?:\u0007|\u001B\\)/g, "")
    .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileTemplatePattern(pattern: string): RegExp {
  const variablePattern = /<([a-zA-Z][a-zA-Z0-9_-]*)>/g;
  let cursor = 0;
  let source = "";
  let match: RegExpExecArray | null;

  while ((match = variablePattern.exec(pattern)) !== null) {
    source += escapeRegex(pattern.slice(cursor, match.index));
    source += `(?<${match[1]}>[\\s\\S]+?)`;
    cursor = match.index + match[0].length;
  }

  source += escapeRegex(pattern.slice(cursor));
  return new RegExp(source, "m");
}

export function matchTrigger(
  trigger: Pick<TriggerDefinition, "pattern" | "matchMode">,
  input: string,
): TriggerMatchResult | null {
  const sanitizedInput = stripAnsiSequences(input);
  if (!sanitizedInput || !trigger.pattern) {
    return null;
  }

  if (trigger.matchMode === "contains") {
    const templateRegex = compileTemplatePattern(trigger.pattern);
    const match = templateRegex.exec(sanitizedInput);
    if (!match) {
      return null;
    }

    const captures = Object.fromEntries(
      Object.entries(match.groups ?? {}).map(([key, value]) => [
        key,
        stripAnsiSequences(value).trim(),
      ]),
    );

    return { captures };
  }

  try {
    const match = new RegExp(trigger.pattern, "m").exec(sanitizedInput);
    if (!match) {
      return null;
    }

    const captures = Object.fromEntries(
      Object.entries(match.groups ?? {}).map(([key, value]) => [
        key,
        stripAnsiSequences(value).trim(),
      ]),
    );

    return { captures };
  } catch {
    return null;
  }
}

export function applyTriggerVariables(
  template: string,
  captures: Record<string, string>,
): string {
  return template
    .replace(/\$\{([a-zA-Z][a-zA-Z0-9_-]*)\}/g, (_, key: string) => captures[key] ?? "")
    .replace(/<([a-zA-Z][a-zA-Z0-9_-]*)>/g, (_, key: string) => captures[key] ?? "");
}
