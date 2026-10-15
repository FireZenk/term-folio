export type Tone = "fg" | "accent" | "muted" | "error";

export type Line = { text: string; tone?: Tone };

export type CommandResult = { lines: Line[]; clear?: boolean };

export type Command = {
  name: string;
  summary: string;
  run: (args: string[]) => CommandResult;
};

export const USER = "guest";
export const HOST = "firezenk";

const line = (text: string, tone?: Tone): Line => ({ text, tone });

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
        line("Tip: commands are case-insensitive.", "muted"),
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

const clear: Command = {
  name: "clear",
  summary: "clear the screen",
  run: () => ({ lines: [], clear: true }),
};

export const commands: Command[] = [help, about, whoami, clear];

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
