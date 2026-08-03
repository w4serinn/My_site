// partials/header.html・footer.html をHTMLに合体し、{{BASE}}を相対パスに変換して
// dist/ に出力するだけの、最小限のビルドスクリプト。
//
// ルール:
// - 各ページのHTMLには <!-- HEADER --> / <!-- FOOTER --> のプレースホルダーを置く
// - リンク・スタイルシート等のパスは "/" から始めず、必ず {{BASE}} を前置する
//   （例: <link rel="stylesheet" href="{{BASE}}styles/tokens.css" />）
// - このスクリプトが、そのページの深さに応じて {{BASE}} を正しい相対パスに変換する

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "partials",
  "scripts",
  "tests",
  "docs",
  ".git",
  ".github",
  ".claude",
]);

const COPY_DIRS = ["styles", "src", "assets"];
const COPY_FILES = ["robots.txt", "sitemap.xml"];

async function readPartial(name) {
  const p = path.join(root, "partials", name);
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return `<!-- ${name} が未作成です。partials/${name} を用意してください -->`;
  }
}

async function findHtmlFiles(dir, base = dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await findHtmlFiles(path.join(dir, entry.name), base, results);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

function relativeBase(filePath, base) {
  const depth = path.relative(base, path.dirname(filePath)).split(path.sep).filter(Boolean).length;
  return depth === 0 ? "./" : "../".repeat(depth);
}

async function copyDir(src, dest) {
  try {
    await fs.access(src);
  } catch {
    return;
  }
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function build() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  const header = await readPartial("header.html");
  const footer = await readPartial("footer.html");

  const htmlFiles = await findHtmlFiles(root);

  for (const filePath of htmlFiles) {
    let content = await fs.readFile(filePath, "utf-8");
    const base = relativeBase(filePath, root);

    content = content
      .replace(/<!--\s*HEADER\s*-->/g, header)
      .replace(/<!--\s*FOOTER\s*-->/g, footer)
      .replace(/\{\{BASE\}\}/g, base);

    const relPath = path.relative(root, filePath);
    const outPath = path.join(distDir, relPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, content, "utf-8");
  }

  for (const dir of COPY_DIRS) {
    await copyDir(path.join(root, dir), path.join(distDir, dir));
  }

  for (const file of COPY_FILES) {
    try {
      await fs.copyFile(path.join(root, file), path.join(distDir, file));
    } catch {
      // 未作成のファイルはスキップ
    }
  }

  console.log(`build完了: ${htmlFiles.length}ページを dist/ に出力しました`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
