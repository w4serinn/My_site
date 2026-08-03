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

  it("ヘッダーナビにNow/Uses/Favorites/Timelineリンクが含まれる", async () => {
    const outPath = path.join(root, "dist", "index.html");
    const content = await fs.readFile(outPath, "utf-8");
    expect(content).toContain("now.html");
    expect(content).toContain("uses.html");
    expect(content).toContain("favorites.html");
    expect(content).toContain("timeline.html");
  });

  it("フッターにColophonリンクと隠しページトリガーが含まれる", async () => {
    const outPath = path.join(root, "dist", "index.html");
    const content = await fs.readFile(outPath, "utf-8");
    expect(content).toContain("colophon.html");
    expect(content).toContain("secret.html");
  });

  it("index.htmlのog:imageが絶対URLのまま保たれている", async () => {
    const outPath = path.join(root, "dist", "index.html");
    const content = await fs.readFile(outPath, "utf-8");
    expect(content).toContain('property="og:image" content="https://w4serinn.github.io/My_site/assets/og-image.svg"');
  });

  it("dist/robots.txt を生成する", async () => {
    const outPath = path.join(root, "dist", "robots.txt");
    const exists = await fs
      .access(outPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("dist/sitemap.xml を生成する", async () => {
    const outPath = path.join(root, "dist", "sitemap.xml");
    const exists = await fs
      .access(outPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("dist/404.html を生成し、<base>で絶対URLを固定している", async () => {
    const outPath = path.join(root, "dist", "404.html");
    const content = await fs.readFile(outPath, "utf-8");
    expect(content).toContain('<base href="https://w4serinn.github.io/My_site/" />');
    expect(content.includes("{{BASE}}")).toBe(false);
  });

  it("実ページ全てにcanonical/og:urlが設定されている", async () => {
    const pages = [
      "index.html",
      "now.html",
      "uses.html",
      "favorites.html",
      "timeline.html",
      "colophon.html",
    ];
    for (const page of pages) {
      const content = await fs.readFile(path.join(root, "dist", page), "utf-8");
      expect(content).toContain(`https://w4serinn.github.io/My_site/${page}`);
      expect(content).toContain('rel="canonical"');
      expect(content).toContain('property="og:url"');
    }
  });

  it("全ページにスキップリンクとmain#main-contentが存在する", async () => {
    const pages = [
      "index.html",
      "now.html",
      "uses.html",
      "favorites.html",
      "timeline.html",
      "colophon.html",
      "secret.html",
      "404.html",
    ];
    for (const page of pages) {
      const content = await fs.readFile(path.join(root, "dist", page), "utf-8");
      expect(content).toContain('href="#main-content" class="skip-link"');
      expect(content).toContain('<main id="main-content">');
    }
  });
});
