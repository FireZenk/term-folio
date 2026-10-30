// Boot script played once on load: a fake system log, the banner and a typed greeting.

import type { Tone } from "@/lib/commands";

export type BootStep = {
  text: string;
  tone?: Tone;
  /** Reveal character by character instead of all at once. */
  typed?: boolean;
  /** Banner rows are drawn as solid cells rather than text. */
  banner?: boolean;
  /** Text read by screen readers in place of a banner row. */
  label?: string;
  /** Milliseconds to wait after the step is fully shown. */
  pause: number;
};

export const TYPE_SPEED = 22;

const BANNER = [
  "█████ █████ ████  █████ █████ █████ █   █ █  █",
  "█       █   █   █ █        █  █     ██  █ █ █",
  "████    █   ████  ████    █   ████  █ █ █ ██",
  "█       █   █  █  █      █    █     █  ██ █ █",
  "█     █████ █   █ █████ █████ █████ █   █ █  █",
];

const ok = (text: string, pause = 90): BootStep => ({ text: `[  ok  ] ${text}`, tone: "muted", pause });

export const bootSteps: BootStep[] = [
  ok("loading kernel modules: tty, keyboard, coffee"),
  ok("mounting /home/guest"),
  ok("starting portfolio daemon (pid 1337)"),
  ok("restoring color scheme"),
  ok("ready.", 260),
  { text: "", pause: 0 },
  ...BANNER.map((text, i) => ({
    text,
    tone: "accent" as const,
    banner: true,
    label: i === 0 ? "FireZenk" : undefined,
    pause: i === BANNER.length - 1 ? 220 : 45,
  })),
  { text: "", pause: 0 },
  { text: "Welcome to term-folio v0.1.0 — Jorge Garrido's portfolio, as a shell.", typed: true, pause: 120 },
  { text: "Type `help` to get started.", tone: "muted", typed: true, pause: 0 },
];
