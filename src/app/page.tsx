export default function Home() {
  return (
    <main className="flex-1 p-6 text-sm sm:text-base">
      <p className="text-term-muted">term-folio v0.1.0</p>
      <p>
        <span className="text-term-accent">guest@firezenk</span>
        <span className="text-term-muted">:~$ </span>
        <span className="cursor" aria-hidden />
      </p>
    </main>
  );
}
