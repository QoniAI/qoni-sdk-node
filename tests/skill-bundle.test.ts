import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The Skill ships in the npm package and is installed with
// `npx skills add ./node_modules/@qoniai/qoni --skill qoni-sdk`. Skill tools
// parse SKILL.md's front matter as YAML and silently skip a skill whose front
// matter does not parse (an unquoted ": " inside the description is enough).

const skill = readFileSync("skills/qoni-sdk/SKILL.md", "utf8");

function frontMatter(text: string): Map<string, string> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) throw new Error("SKILL.md has no front matter");
  const fields = new Map<string, string>();
  for (const line of match[1]!.split("\n")) {
    const at = line.indexOf(": ");
    if (at <= 0) throw new Error(`front matter line is not "key: value": ${line}`);
    fields.set(line.slice(0, at), line.slice(at + 2));
  }
  return fields;
}

describe("bundled qoni-sdk skill", () => {
  it("has front matter a YAML parser accepts: name and a plain one-line description", () => {
    const fields = frontMatter(skill);
    expect(fields.get("name")).toBe("qoni-sdk");
    const description = fields.get("description") ?? "";
    expect(description.length).toBeGreaterThan(40);
    // A plain YAML scalar may not contain ": " or " #", and may not start with a YAML indicator.
    if (!/^["']/.test(description)) {
      expect(description).not.toMatch(/: | #/);
      expect(description).not.toMatch(/^[-?:,[\]{}#&*!|>'"%@`]/);
    }
  });

  it("routes personal agent work to the reference files it ships", () => {
    expect(skill).toContain("references/personal-agent.md");
    expect(skill).toContain("references/personal-agent-server.ts");
    const guide = readFileSync("skills/qoni-sdk/references/personal-agent.md", "utf8");
    // Every rule the reference code cites exists in the guide.
    const code = readFileSync("skills/qoni-sdk/references/personal-agent-server.ts", "utf8");
    const cited = new Set([...code.matchAll(/rules? (\d+)/g)].map((m) => Number(m[1])));
    for (const rule of cited) expect(guide).toMatch(new RegExp(`### Rule ${rule}\\. `));
  });
});
