import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".playwright-cli",
  ".pnpm-store",
  ".secrets",
  "coverage",
  "node_modules",
]);
const legacyUpper = ["E", "A", "K"].join("");
const legacyTitle = `${legacyUpper[0]}${legacyUpper.slice(1).toLowerCase()}`;
const legacyLower = legacyUpper.toLowerCase();
const contentPattern = new RegExp(
  `${legacyUpper}(?![a-z])|${legacyTitle}(?=[A-Z]|[^A-Za-z]|$)|(?<![A-Za-z])${legacyLower}(?![a-z])`,
);
const pathPattern = new RegExp(`(^|[/_.-])${legacyLower}($|[/_.-])`, "i");
const violations = [];

await walk(root);

if (violations.length > 0) {
  console.error("Legacy brand identifiers remain:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Brand check passed: only Qoni identifiers are present.");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath);
    if (entry.isFile() && (entry.name === ".env" || entry.name.startsWith(".env."))) continue;
    if (pathPattern.test(relativePath)) violations.push(`${relativePath} (path)`);

    if (entry.isDirectory()) {
      await walk(absolutePath);
      continue;
    }
    if (!entry.isFile()) continue;

    const bytes = await readFile(absolutePath);
    if (bytes.includes(0)) continue;

    const lines = bytes.toString("utf8").split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      if (contentPattern.test(lines[index])) {
        violations.push(`${relativePath}:${index + 1}`);
      }
    }
  }
}
