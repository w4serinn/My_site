import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

async function findHtmlFiles(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await findHtmlFiles(path.join(dir, entry.name), results);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

// href="/..." や src="/..." のような、ドメイン直下からの絶対パス指定を検出する。
// {{BASE}} を前置した相対パス指定を必ず使う運用のため、絶対パスは基本的に禁止。
const ABSOLUTE_PATH_PATTERN = /(href|src)="\/(?!\/)/;

describe("no-absolute-paths", () => {
  it("HTML内に絶対パス（先頭が/）のリンク・参照がない", async () => {
    const files = await findHtmlFiles(root);
    const offenders = [];
    for (const file of files) {
      const content = await fs.readFile(file, "utf-8");
      if (ABSOLUTE_PATH_PATTERN.test(content)) {
        offenders.push(path.relative(root, file));
      }
    }
    expect(offenders).toEqual([]);
  });
});
