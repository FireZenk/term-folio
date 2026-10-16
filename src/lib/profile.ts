// Portfolio content, kept apart from command logic so it's easy to extend.

export type Project = {
  name: string;
  pitch: string;
  stack: string[];
  repo: string;
  demo?: string;
};

export type SkillGroup = {
  title: string;
  skills: { name: string; level: number }[]; // level: 1-5
};

export type Contact = { label: string; value: string; href: string };

export const GITHUB = "https://github.com/FireZenk";

export const projects: Project[] = [
  {
    name: "term-folio",
    pitch: "This very site — a portfolio you explore from a terminal.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    repo: `${GITHUB}/term-folio`,
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    skills: [
      { name: "TypeScript", level: 5 },
      { name: "JavaScript", level: 5 },
      { name: "Rust", level: 3 },
    ],
  },
  {
    title: "Frontend",
    skills: [
      { name: "React", level: 5 },
      { name: "Next.js", level: 4 },
      { name: "Tailwind CSS", level: 4 },
      { name: "Three.js / R3F", level: 3 },
      { name: "Canvas 2D", level: 4 },
    ],
  },
  {
    title: "Tooling",
    skills: [
      { name: "Git & GitHub Actions", level: 4 },
      { name: "Node.js", level: 4 },
      { name: "Vercel", level: 4 },
    ],
  },
];

export const contacts: Contact[] = [
  { label: "github", value: "github.com/FireZenk", href: GITHUB },
  {
    label: "issues",
    value: "say hi on the term-folio repo",
    href: `${GITHUB}/term-folio/issues/new`,
  },
];
