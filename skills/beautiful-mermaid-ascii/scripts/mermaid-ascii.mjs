#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

function usage() {
  process.stdout.write(
    [
      "mermaid-ascii.mjs (internal)",
      "",
      "Options:",
      "  --pkg-dir DIR   Directory to chdir into so Node can resolve beautiful-mermaid from DIR/node_modules",
      "  --mode raw|md   Treat input as raw Mermaid or Markdown with ```mermaid fences",
      "  --block N       1-based mermaid fence index (when --mode md)",
      "  --list 0|1      List available mermaid fences and exit",
      "  --input PATH    File containing input text",
      "",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const out = {
    pkgDir: "",
    mode: "raw",
    block: 1,
    list: false,
    input: "",
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      usage();
      process.exit(0);
    }
    if (a === "--pkg-dir") out.pkgDir = argv[++i] ?? "";
    else if (a === "--mode") out.mode = argv[++i] ?? "raw";
    else if (a === "--block") out.block = Number(argv[++i] ?? "1");
    else if (a === "--list") out.list = (argv[++i] ?? "0") === "1";
    else if (a === "--input") out.input = argv[++i] ?? "";
    else {
      process.stderr.write(`Unknown arg: ${a}\n`);
      usage();
      process.exit(2);
    }
  }

  if (!out.pkgDir) {
    process.stderr.write("--pkg-dir is required\n");
    process.exit(2);
  }
  if (!out.input) {
    process.stderr.write("--input is required\n");
    process.exit(2);
  }
  if (!Number.isFinite(out.block) || out.block < 1) {
    process.stderr.write("--block must be a positive integer\n");
    process.exit(2);
  }
  if (out.mode !== "raw" && out.mode !== "md") {
    process.stderr.write("--mode must be raw or md\n");
    process.exit(2);
  }

  return out;
}

function extractMermaidFences(md) {
  // Minimal Markdown fence parser:
  // - Only supports triple-backtick fences
  // - Only captures ```mermaid ... ```
  // - Keeps inner text verbatim
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let inFence = false;
  let buf = [];
  for (const line of lines) {
    if (!inFence) {
      if (line.trim().toLowerCase() === "```mermaid") {
        inFence = true;
        buf = [];
      }
      continue;
    }

    if (line.trim() === "```") {
      blocks.push(buf.join("\n").trimEnd());
      inFence = false;
      buf = [];
      continue;
    }

    buf.push(line);
  }
  return blocks;
}

function firstNonEmptyLine(s) {
  for (const line of s.split(/\r?\n/)) {
    const t = line.trim();
    if (t) return t;
  }
  return "";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const pkgDirAbs = path.resolve(process.cwd(), args.pkgDir);
  const requireFromPkg = createRequire(path.join(pkgDirAbs, "package.json"));

  const raw = fs.readFileSync(args.input, "utf8");

  const resolvedEntry = requireFromPkg.resolve("beautiful-mermaid");
  const bm = await import(pathToFileURL(resolvedEntry).href);
  const renderMermaidAscii = bm.renderMermaidAscii;
  if (typeof renderMermaidAscii !== "function") {
    throw new Error(
      "beautiful-mermaid did not export renderMermaidAscii() as expected. Check installed version.",
    );
  }

  if (args.mode === "md") {
    const blocks = extractMermaidFences(raw);
    if (args.list) {
      if (blocks.length === 0) {
        process.stdout.write("No ```mermaid fenced blocks found.\n");
        return;
      }
      for (let i = 0; i < blocks.length; i++) {
        process.stdout.write(`${i + 1}: ${firstNonEmptyLine(blocks[i])}\n`);
      }
      return;
    }

    const idx = args.block - 1;
    if (!blocks[idx]) {
      process.stderr.write(
        `Requested block ${args.block}, but only found ${blocks.length} mermaid block(s). Use --list.\n`,
      );
      process.exit(1);
    }

    process.stdout.write(renderMermaidAscii(blocks[idx]) + "\n");
    return;
  }

  if (args.list) {
    process.stdout.write("--list is only meaningful with --mode md\n");
    return;
  }

  process.stdout.write(renderMermaidAscii(raw) + "\n");
}

main().catch((err) => {
  const msg = err && typeof err === "object" && "stack" in err ? err.stack : String(err);
  process.stderr.write(`${msg}\n`);
  process.exit(1);
});
