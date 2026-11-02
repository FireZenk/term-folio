// Social preview: a terminal window showing the boot banner and a first command.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BANNER } from "@/lib/boot";

export const alt = "term-folio — Jorge Garrido's portfolio, as a terminal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default theme palette, mirrored from globals.css (CSS variables don't reach satori).
const C = {
  bg: "#0d1117",
  chrome: "#161b22",
  border: "#30363d",
  fg: "#c9d1d9",
  accent: "#3fb950",
  muted: "#6e7681",
};

const CELL = 18;

// Literal paths so output file tracing ships the fonts with the serverless function.
const FONTS = join(process.cwd(), "node_modules/@fontsource/jetbrains-mono/files");

export default async function OpengraphImage() {
  const [regular, bold] = await Promise.all([
    readFile(join(FONTS, "jetbrains-mono-latin-400-normal.woff")),
    readFile(join(FONTS, "jetbrains-mono-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 30% 20%, #1c2a22 0%, ${C.bg} 60%)`,
          fontFamily: "JetBrains Mono",
        }}
      >
        <div
          style={{
            width: 1080,
            display: "flex",
            flexDirection: "column",
            border: `2px solid ${C.border}`,
            borderRadius: 16,
            background: C.bg,
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 22px",
              background: C.chrome,
              borderBottom: `2px solid ${C.border}`,
            }}
          >
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((dot) => (
              <div key={dot} style={{ width: 16, height: 16, borderRadius: 8, background: dot }} />
            ))}
            <div style={{ display: "flex", marginLeft: 16, color: C.muted, fontSize: 22 }}>guest@firezenk: ~</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", padding: "40px 48px 44px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {BANNER.map((row, y) => (
                <div key={y} style={{ display: "flex" }}>
                  {[...row].map((ch, x) => (
                    <div
                      key={x}
                      style={{
                        width: CELL,
                        height: CELL,
                        background: ch === " " ? "transparent" : C.accent,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: 40, fontSize: 30, color: C.fg }}>
              Jorge Garrido&apos;s portfolio, as a shell.
            </div>

            <div style={{ display: "flex", marginTop: 28, fontSize: 28 }}>
              <span style={{ color: C.accent, fontWeight: 700 }}>guest@firezenk</span>
              <span style={{ color: C.muted }}>:~$&nbsp;</span>
              <span style={{ color: C.fg }}>help</span>
              <div style={{ width: 16, height: 34, marginLeft: 6, background: C.fg }} />
            </div>

            <div style={{ display: "flex", marginTop: 18, fontSize: 22, color: C.muted }}>
              about · projects · skills · contact · theme
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "JetBrains Mono", data: regular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
