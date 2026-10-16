"use client";

import { useEffect, useRef, useState } from "react";
import { HOST, USER, execute, type Line, type Tone } from "@/lib/commands";

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

  // Keep the latest line in view as scrollback grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  function submit() {
    const command = input.trim();
    const result = execute(command);
    const entry = { id: nextId.current++, command, output: result.lines };
    setEntries((prev) => (result.clear ? [] : [...prev, entry]));
    setInput("");
    setCaret(0);
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
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </label>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
