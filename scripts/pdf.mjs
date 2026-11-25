#!/usr/bin/env node
/**
 * Builds the site, renders it to a PDF with headless Chromium and saves the
 * result to public/<pdfFileName> (from src/content/profile.md), then rebuilds
 * so dist/ contains the PDF and the "Download PDF" link.
 *
 * The PDF is tagged (structure tree for screen readers and parsers) and has a
 * document outline built from the headings.
 *
 * Usage: pnpm pdf [--format=A4|Letter]
 */
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { build, preview } from "astro";
import { chromium } from "playwright";

const root = process.cwd();
const format =
  process.argv.find((arg) => arg.startsWith("--format="))?.split("=")[1] ??
  "A4";

const profile = await readFile(join(root, "src/content/profile.md"), "utf8");
const pdfFileName =
  profile.match(/^pdfFileName:\s*["']?([^"'\n]+?\.pdf)["']?\s*$/m)?.[1] ??
  "cv.pdf";
const outFile = join(root, "public", pdfFileName);

console.log("› Building site…");
await build({ root, logLevel: "warn" });

const server = await preview({
  root,
  logLevel: "warn",
  server: { port: 4329 },
});
const browser = await launchBrowser();

try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${server.port}/`, {
    waitUntil: "networkidle",
  });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);

  await mkdir(join(root, "public"), { recursive: true });
  await page.pdf({
    path: outFile,
    format,
    // Margins come from the @page rule in global.css.
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    tagged: true,
    outline: true,
  });
  console.log(`› Saved ${outFile}`);
} finally {
  await browser.close();
  await server.stop();
}

console.log("› Rebuilding site with the PDF included…");
await build({ root, logLevel: "warn" });
console.log("✓ Done");

/** Prefer an installed Google Chrome; fall back to Playwright's bundled Chromium. */
async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    try {
      return await chromium.launch();
    } catch (error) {
      console.error(
        "Could not start Chrome or Chromium. Install one with:\n  pnpm exec playwright install chromium",
      );
      throw error;
    }
  }
}
