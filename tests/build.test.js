import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

beforeAll(() => {
  execSync("node scripts/build.js", { cwd: root, stdio: "inherit" });
});

describe("build", () => {
  it("dist/index.html を生成する", async () => {
    const outPath = path.join(root, "dist", "index.html");
    const exists = await fs
      .access(outPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("{{BASE}} プレースホルダーが残っていない", async () => {
    const outPath = path.join(root, "dist", "index.html");
    const content = await fs.readFile(outPath, "utf-8");
    expect(content.includes("{{BASE}}")).toBe(false);
  });

  it("HEADER/FOOTER プレースホルダーが合体されている", async () => {
    const outPath = path.join(root, "dist", "index.html");
    const content = await fs.readFile(outPath, "utf-8");
    expect(content.includes("<!-- HEADER -->")).toBe(false);
    expect(content.includes("<!-- FOOTER -->")).toBe(false);
    expect(content.includes("site-header")).toBe(true);
  });
});
