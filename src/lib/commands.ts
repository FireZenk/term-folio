import { contacts, projects, skillGroups } from "@/lib/profile";
import { DEFAULT_THEME, currentTheme, isTheme, themes } from "@/lib/themes";

export type Tone = "fg" | "accent" | "muted" | "error";

export type Line = { text: string; tone?: Tone; href?: string };

export type CommandResult = { lines: Line[]; clear?: boolean; theme?: string };

export type Command = {
  name: string;
  summary: string;
  /** Values offered by Tab completion for the first argument. */
  args?: string[];
  run: (args: string[]) => CommandResult;
};

export const USER = "guest";
export const HOST = "firezenk";

const line = (text: string, tone?: Tone): Line => ({ text, tone });

const link = (text: string, href: string): Line => ({ text, tone: "accent", href });

const help: Command = {
  name: "help",
  summary: "list available commands",
  run: () => {
    const width = Math.max(...commands.map((c) => c.name.length)) + 4;
    return {
      lines: [
        line("Available commands:", "accent"),
        line(""),
        ...commands.map((c) => line(`  ${c.name.padEnd(width)}${c.summary}`)),
        line(""),
        line("Tip: Tab completes, ↑/↓ browse history, commands are case-insensitive.", "muted"),
      ],
    };
  },
};

const about: Command = {
  name: "about",
  summary: "who is behind this terminal",
  run: () => ({
    lines: [
      line("Jorge Garrido — FireZenk", "accent"),
      line(""),
      line("Software engineer who likes building things that feel good to use:"),
      line("snappy interfaces, tiny games, and tools that live in the terminal."),
      line(""),
      line("This site is one of them. Poke around — `help` lists everything.", "muted"),
    ],
  }),
};

const whoami: Command = {
  name: "whoami",
  summary: "print the current user",
  run: () => ({ lines: [line(USER)] }),
};

const projectsCmd: Command = {
  name: "projects",
  summary: "things I've built",
  run: () => ({
    lines: [
      line(`Projects (${projects.length})`, "accent"),
      ...projects.flatMap((p) => [
        line(""),
        line(`▸ ${p.name}`, "accent"),
        line(`  ${p.pitch}`),
        line(`  ${p.stack.join(" · ")}`, "muted"),
        link(`  repo  ${p.repo.replace("https://", "")}`, p.repo),
        ...(p.demo ? [link(`  demo  ${p.demo.replace("https://", "")}`, p.demo)] : []),
      ]),
      line(""),
      line("More on the way — this list grows as I ship.", "muted"),
    ],
  }),
};

const skills: Command = {
  name: "skills",
  summary: "languages, frameworks and tools",
  run: () => {
    const width = Math.max(...skillGroups.flatMap((g) => g.skills.map((s) => s.name.length))) + 2;
    return {
      lines: skillGroups.flatMap((group, i) => [
        ...(i > 0 ? [line("")] : []),
        line(group.title, "accent"),
        ...group.skills.map((s) =>
          line(`  ${s.name.padEnd(width)}${"■".repeat(s.level)}${"□".repeat(5 - s.level)}`),
        ),
      ]),
    };
  },
};

const contact: Command = {
  name: "contact",
  summary: "where to find me",
  run: () => {
    const width = Math.max(...contacts.map((c) => c.label.length)) + 2;
    return {
      lines: [
        line("Get in touch", "accent"),
        line(""),
        ...contacts.map((c) => link(`  ${c.label.padEnd(width)}${c.value}`, c.href)),
        line(""),
        line("Links open in a new tab.", "muted"),
      ],
    };
  },
};

const theme: Command = {
  name: "theme",
  summary: "switch color scheme",
  args: themes.map((t) => t.name),
  run: ([arg]) => {
    if (!arg) {
      const active = currentTheme();
      const width = Math.max(...themes.map((t) => t.name.length)) + 4;
      return {
        lines: [
          line("Themes", "accent"),
          line(""),
          ...themes.map((t) =>
            t.name === active
              ? line(`● ${t.name.padEnd(width)}${t.description}`, "accent")
              : line(`  ${t.name.padEnd(width)}${t.description}`),
          ),
          line(""),
          line("Usage: theme <name>  (your choice is remembered)", "muted"),
        ],
      };
    }

    const name = arg.toLowerCase();
    if (!isTheme(name)) {
      return {
        lines: [
          line(`theme: unknown theme '${arg}'`, "error"),
          line(`Try one of: ${themes.map((t) => t.name).join(", ")}`, "muted"),
        ],
      };
    }
    const suffix = name === DEFAULT_THEME ? " — back to basics." : ".";
    return { lines: [line(`Theme set to ${name}${suffix}`, "accent")], theme: name };
  },
};

const clear: Command = {
  name: "clear",
  summary: "clear the screen",
  run: () => ({ lines: [], clear: true }),
};

export const commands: Command[] = [help, about, projectsCmd, skills, contact, theme, whoami, clear];

const registry = new Map(commands.map((c) => [c.name, c]));

export function execute(input: string): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return { lines: [] };

  const command = registry.get(name.toLowerCase());
  if (!command) {
    return {
      lines: [
        line(`command not found: ${name}`, "error"),
        line("Type `help` to see what's available.", "muted"),
      ],
    };
  }
  return command.run(args);
}

export type Completion = { value: string; candidates: string[] };

/**
 * Shell-style completion for the command name and, for commands that declare
 * them, its first argument: a single match is completed in full, several
 * matches are extended to their longest common prefix and, when that adds
 * nothing, returned as candidates to list.
 */
export function complete(input: string): Completion {
  const none = { value: input, candidates: [] };
  const text = input.trimStart();
  const words = text.split(/\s+/);

  if (words.length === 1) {
    return completeWord(input, "", words[0], commands.map((c) => c.name));
  }
  if (words.length === 2) {
    const options = registry.get(words[0].toLowerCase())?.args;
    if (!options) return none;
    return completeWord(input, `${words[0]} `, words[1], options);
  }
  return none;
}

function completeWord(input: string, head: string, word: string, options: string[]): Completion {
  const prefix = word.toLowerCase();
  const matches = options.filter((o) => o.startsWith(prefix));
  if (matches.length === 0) return { value: input, candidates: [] };
  if (matches.length === 1) return { value: `${head}${matches[0]} `, candidates: [] };

  let common = matches[0];
  for (const m of matches) {
    while (!m.startsWith(common)) common = common.slice(0, -1);
  }
  return common.length > prefix.length
    ? { value: `${head}${common}`, candidates: [] }
    : { value: input, candidates: matches };
}
