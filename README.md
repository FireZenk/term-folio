# term-folio

> My portfolio, as a terminal. Type `help` and explore.

An interactive, keyboard-first portfolio that looks and behaves like a shell —
command history, tab completion, themes and all.

## Features

- [x] Terminal shell UI (prompt, input, scrollback)
- [x] Command registry: `help`, `about`, `whoami`, `clear`
- [x] Commands: `projects`, `skills`, `contact` (with clickable links)
- [x] Tab autocomplete and ↑/↓ history navigation
- [x] `theme` command — dracula, matrix, gruvbox, solarized (remembered across visits)
- [ ] Boot sequence with ASCII banner and typing effect
- [ ] Live deployment on Vercel

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- JetBrains Mono

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## License

[MIT](LICENSE) © Jorge Garrido
