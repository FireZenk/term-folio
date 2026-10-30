"use client";

import { useEffect, useRef, useState } from "react";
import { HOST, USER, complete, execute, type Line, type Tone } from "@/lib/commands";
import { applyTheme } from "@/lib/themes";
import { TYPE_SPEED, bootSteps, type BootStep } from "@/lib/boot";

type Entry = { id: number; command: string; output: Line[] };

const toneClass: Record<Tone, string> = {
  fg: "text-term-fg",
  accent: "text-term-accent",
  muted: "text-term-muted",
  error: "text-term-error",
};

// Backtick-quoted words in boot text are highlighted like commands.
function highlight(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="text-term-accent">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function BootLine({ step, chars }: { step: BootStep; chars?: number }) {
  // Banner glyphs are drawn as 1ch cells: block characters fall back to fonts
  // with other widths, which would skew the letters.
  if (step.banner) {
    return (
      <p className={`flex text-[0.6rem] sm:text-sm ${toneClass[step.tone ?? "fg"]}`}>
        {step.label && <span className="sr-only">{step.label}</span>}
        {[...step.text].map((c, i) => (
          <span key={i} aria-hidden className={`inline-block h-[1.2em] w-[1ch] ${c === " " ? "" : "bg-current shadow-[0_0_0_0.5px_currentColor]"}`} />
        ))}
      </p>
    );
  }

  const text = chars === undefined ? step.text : step.text.slice(0, chars);
  return (
    <p className={`whitespace-pre-wrap ${toneClass[step.tone ?? "fg"]}`}>
      {highlight(text)}
      {chars !== undefined && <span className="cursor" aria-hidden />}
      {!text && chars === undefined && "\u00a0"}
    </p>
  );
}

function Prompt() {
  return (
    <>
      <span className="text-term-accent">
        {USER}@{HOST}
      </span>
      <span className="text-term-muted">:~$ </span>
    </>
  );
}

export default function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const history = useRef<string[]>([]);
  // Position while browsing history; equals history length when on the draft.
  const cursor = useRef(0);
  const draft = useRef("");
  // Boot progress: steps fully shown, and characters typed of the current one.
  const [step, setStep] = useState(0);
  const [chars, setChars] = useState(0);
  const booting = step < bootSteps.length;

  useEffect(() => {
    if (!booting) return;
    // Visitors who prefer reduced motion get the boot output straight away.
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const current = bootSteps[step];
    const typing = current.typed && chars < current.text.length;
    const timer = setTimeout(
      () => {
        if (instant) {
          setStep(bootSteps.length);
        } else if (typing) {
          setChars((c) => c + 1);
        } else {
          setStep((s) => s + 1);
          setChars(0);
        }
      },
      instant ? 0 : typing ? TYPE_SPEED : current.pause,
    );
    return () => clearTimeout(timer);
  }, [booting, step, chars]);

  // Any key skips the boot sequence.
  useEffect(() => {
    if (!booting) return;
    const skip = () => setStep(bootSteps.length);
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [booting]);

  // Keep the latest line in view as scrollback grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries, step]);

  function submit() {
    const command = input.trim();
    const result = execute(command);
    const entry = { id: nextId.current++, command, output: result.lines };
    setEntries((prev) => (result.clear ? [] : [...prev, entry]));
    if (result.theme) applyTheme(result.theme);
    if (command && history.current.at(-1) !== command) history.current.push(command);
    cursor.current = history.current.length;
    draft.current = "";
    setInput("");
    setCaret(0);
  }

  // Replace the input programmatically and park the caret at the end.
  function fill(value: string) {
    setInput(value);
    setCaret(value.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(value.length, value.length));
  }

  function browse(step: -1 | 1) {
    const next = cursor.current + step;
    if (next < 0 || next > history.current.length) return;
    if (cursor.current === history.current.length) draft.current = input;
    cursor.current = next;
    fill(history.current[next] ?? draft.current);
  }

  function tab() {
    const { value, candidates } = complete(input);
    if (candidates.length > 0) {
      const entry = { id: nextId.current++, command: input, output: [{ text: candidates.join("  ") }] };
      setEntries((prev) => [...prev, entry]);
    }
    fill(value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Enter":
        submit();
        break;
      case "Tab":
        e.preventDefault();
        tab();
        break;
      case "ArrowUp":
        e.preventDefault();
        browse(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        browse(1);
        break;
    }
  }

  function syncCaret() {
    setCaret(inputRef.current?.selectionStart ?? input.length);
  }

  return (
    <section
      className="flex flex-1 flex-col overflow-hidden rounded-lg border border-term-muted/30 shadow-2xl shadow-black/50"
      onClick={() => (booting ? setStep(bootSteps.length) : inputRef.current?.focus())}
    >
      <header className="flex items-center gap-2 border-b border-term-muted/30 bg-black/30 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="flex-1 text-center text-xs text-term-muted">
          {USER}@{HOST}: ~
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 leading-relaxed" role="log" aria-live="polite">
        {bootSteps.slice(0, step).map((s, i) => (
          <BootLine key={i} step={s} />
        ))}
        {booting && <BootLine step={bootSteps[step]} chars={bootSteps[step].typed ? chars : undefined} />}
        {booting ? (
          <p className="mt-4 text-xs text-term-muted/70">press any key to skip</p>
        ) : (
          <p aria-hidden>{"\u00a0"}</p>
        )}

        {entries.map((entry) => (
          <div key={entry.id}>
            <p className="whitespace-pre-wrap break-all">
              <Prompt />
              {entry.command}
            </p>
            {entry.output.map((line, i) => (
              <p key={i} className={`whitespace-pre-wrap ${toneClass[line.tone ?? "fg"]}`}>
                {line.href ? (
                  <a
                    href={line.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {line.text}
                  </a>
                ) : (
                  line.text || "\u00a0"
                )}
              </p>
            ))}
          </div>
        ))}

        {!booting && (
          <label className="relative block whitespace-pre-wrap break-all">
            <Prompt />
            <span>{input.slice(0, caret)}</span>
            <span className="cursor" aria-hidden />
            <span>{input.slice(caret)}</span>
            <input
              ref={inputRef}
              value={input}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal input"
              className="absolute inset-0 h-full w-full opacity-0"
              onChange={(e) => {
                setInput(e.target.value);
                setCaret(e.target.selectionStart ?? e.target.value.length);
              }}
              onSelect={syncCaret}
              onKeyDown={onKeyDown}
            />
          </label>
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
