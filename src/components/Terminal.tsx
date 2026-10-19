"use client";

import { useEffect, useRef, useState } from "react";
import { HOST, USER, complete, execute, type Line, type Tone } from "@/lib/commands";

type Entry = { id: number; command: string; output: Line[] };

const toneClass: Record<Tone, string> = {
  fg: "text-term-fg",
  accent: "text-term-accent",
  muted: "text-term-muted",
  error: "text-term-error",
};

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

  // Keep the latest line in view as scrollback grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  function submit() {
    const command = input.trim();
    const result = execute(command);
    const entry = { id: nextId.current++, command, output: result.lines };
    setEntries((prev) => (result.clear ? [] : [...prev, entry]));
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
      onClick={() => inputRef.current?.focus()}
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
        <p className="text-term-muted">
          term-folio v0.1.0 — type <span className="text-term-accent">help</span> to get started.
        </p>

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
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
