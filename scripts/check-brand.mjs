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
const removedConstructor = ["Qoni", "Agent", "Kit"].join("");
const contentPattern = new RegExp(
  `${legacyUpper}(?![a-z])|${legacyTitle}(?=[A-Z]|[^A-Za-z]|$)|(?<![A-Za-z])${legacyLower}(?![a-z])`,
);
const pathPattern = new RegExp(`(^|[/_.-])${legacyLower}($|[/_.-])`, "i");
const allowedWirePatterns = [
  new RegExp(`/api/v3/${legacyLower}(?=/|[\\s\"'\\x60]|$)`, "g"),
  new RegExp(`${legacyLower}_delegation_token`, "g"),
  new RegExp(`${legacyLower}_tenant_id`, "g"),
  // Infrastructure runner tag. Keep until the GitLab runner itself is renamed.
  new RegExp(`${legacyLower}-us`, "g"),
  new RegExp(
    `${legacyLower}\\.(?:auth|delegation|genauth|token_exchange|hosted_login|credential)(?:\\.[a-z0-9_]+)+`,
    "g",
  ),
  new RegExp(`${legacyLower}\\.\\*`, "g"),
  new RegExp(`${legacyLower}BaseUrl`, "g"),
];
const violations = [];

await walk(root);

if (violations.length > 0) {
  console.error("Legacy brand identifiers remain:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Brand check passed: public identifiers use Qoni; approved server wire identifiers are unchanged.");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;

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

    const text = bytes.toString("utf8");
    const lines = entry.name.endsWith(".map")
      ? sourceMapText(text, relativePath).split(/\r?\n/)
      : text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const checkedLine = withoutAllowedWireIdentifiers(lines[index], relativePath);
      if (contentPattern.test(checkedLine) || checkedLine.includes(removedConstructor)) {
        violations.push(`${relativePath}:${index + 1}`);
      }
    }
  }
}

function sourceMapText(text, relativePath) {
  try {
    const sourceMap = JSON.parse(text);
    const sourcesContent = Array.isArray(sourceMap.sourcesContent)
      ? sourceMap.sourcesContent.filter((value) => typeof value === "string")
      : [];
    const names = Array.isArray(sourceMap.names)
      ? sourceMap.names.filter((value) => typeof value === "string")
      : [];
    return [...sourcesContent, ...names].join("\n");
  } catch {
    violations.push(`${relativePath} (invalid source map)`);
    return "";
  }
}

function withoutAllowedWireIdentifiers(line, _relativePath) {
  let result = line;
  for (const pattern of allowedWirePatterns) result = result.replace(pattern, "");

  // Runtime-config models use a property/service discriminator with this exact
  // spelling. Match the syntax rather than a file path so generated JS, DTS,
  // and source maps are checked by the same rule. `client.<legacy>` and
  // branded type/class identifiers are intentionally not allowed here.
  result = result.replace(new RegExp(`\\b${legacyLower}(?=\\??:)`, "g"), "");
  result = result.replace(new RegExp(`([\"'])${legacyLower}\\1`, "g"), "");
  return result;
}
