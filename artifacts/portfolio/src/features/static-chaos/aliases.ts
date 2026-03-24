export type AliasDefinition = {
  key: string;
  commands: string;
  description: string;
  builtIn?: boolean;
};

export type CustomAlias = {
  key: string;
  commands: string;
};

export type AliasDraft = {
  key: string;
  commands: string;
};

export const ALIAS_STORAGE_KEY = "static-chaos.aliases.v1";

export const BUILT_IN_ALIASES: AliasDefinition[] = [
  {
    key: "prep",
    commands: "score; affects; equipment",
    description: "Quick status sweep before travel or combat.",
    builtIn: true,
  },
  {
    key: "travel",
    commands: "where; scan; exits",
    description: "Check surroundings, nearby targets, and exits in one pass.",
    builtIn: true,
  },
  {
    key: "corpse",
    commands: "get all corpse",
    description: "Loot a corpse without typing the full command.",
    builtIn: true,
  },
  {
    key: "cleanup",
    commands: "get all corpse; look in corpse; sacrifice corpse",
    description: "Classic post-fight cleanup flow.",
    builtIn: true,
  },
  {
    key: "quiet",
    commands:
      "channels -auction; channels -chat; channels -music; channels -question; channels -shout; channels -yell",
    description: "Reduce channel noise for focused play.",
    builtIn: true,
  },
  {
    key: "loud",
    commands:
      "channels +auction; channels +chat; channels +music; channels +question; channels +shout; channels +yell",
    description: "Restore the common chatter channels.",
    builtIn: true,
  },
  {
    key: "panic",
    commands: "/",
    description: "Immediate recall shortcut.",
    builtIn: true,
  },
];

export const BUILT_IN_ALIAS_MAP = new Map(
  BUILT_IN_ALIASES.map((alias) => [alias.key, alias] as const),
);

export function normalizeAliasKey(value: string): string {
  return value.trim().toLowerCase();
}

export function splitAliasCommands(value: string): string[] {
  return value
    .split(/[\n;]+/)
    .map((command) => command.trim())
    .filter((command) => command.length > 0);
}

export function parseStoredAliases(value: unknown): CustomAlias[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const aliases = value
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const key = normalizeAliasKey("key" in entry ? String(entry.key) : "");
      const commands = "commands" in entry ? String(entry.commands).trim() : "";
      if (!key || !commands || BUILT_IN_ALIAS_MAP.has(key)) {
        return [];
      }

      return [{ key, commands }];
    })
    .sort((left, right) => left.key.localeCompare(right.key));

  return aliases.filter(
    (alias, index) =>
      aliases.findIndex((candidate) => candidate.key === alias.key) === index,
  );
}

export function resolveAlias(
  input: string,
  aliasMap: Map<string, AliasDefinition>,
): { alias: AliasDefinition; commands: string[]; preview: string } | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\S+)(?:\s+(.*))?$/);
  if (!match) {
    return null;
  }

  const [, rawKey, rawArgs = ""] = match;
  const alias = aliasMap.get(normalizeAliasKey(rawKey));
  if (!alias) {
    return null;
  }

  const args = rawArgs.trim();
  let commands = splitAliasCommands(
    alias.commands.includes("$*")
      ? alias.commands.replace(/\$\*/g, args)
      : alias.commands,
  );

  if (commands.length === 1 && args.length > 0 && !alias.commands.includes("$*")) {
    commands = [`${commands[0]} ${args}`.trim()];
  }

  if (commands.length === 0) {
    return null;
  }

  return {
    alias,
    commands,
    preview: commands.join(" ; "),
  };
}
