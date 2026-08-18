// Generate src/generated/event-types.ts from the vendored event catalog.
//
// The catalog (src/generated/event-catalog.json) is a verbatim copy of the
// backend's published artifact (webagentbackend/docs/events/catalog.json,
// itself generated from domain.event.types.EventType — the single source of
// truth). To re-sync after the backend adds an event type:
//
//   cp ../webagentbackend/docs/events/catalog.json src/generated/event-catalog.json
//   pnpm gen:event-types
//
// WireEventTypes is the complete (INTERNAL) wire-event catalog. The key for
// each wire string is the backend enum member name, derived deterministically:
// uppercase + "." → "_" (e.g. "run.action.started" → RUN_ACTION_STARTED).
//
// Run with --check to verify the committed output is up to date (CI / test).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(here, "..", "src", "generated", "event-catalog.json");
const outPath = join(here, "..", "src", "generated", "event-types.ts");
const interactionsOutPath = join(here, "..", "src", "generated", "interaction-types.ts");

/** "run.action.started" → "RUN_ACTION_STARTED" (matches backend enum names). */
function keyFor(wire) {
  const key = wire.toUpperCase().replace(/\./g, "_");
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
    throw new Error(`wire type "${wire}" does not map to a valid identifier ("${key}")`);
  }
  return key;
}

/** "site_login" → "SiteLogin", "confirm_signed_in" → "ConfirmSignedIn". */
function pascalCase(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** "confirm_signed_in" → "confirmSignedIn" (the curated const-object member). */
function camelCase(value) {
  const pascal = pascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function render(catalog) {
  const seenKeys = new Set();
  const entries = catalog.event_types.map((wire) => {
    const key = keyFor(wire);
    if (seenKeys.has(key)) throw new Error(`duplicate generated key ${key} (from ${wire})`);
    seenKeys.add(key);
    return `  ${key}: ${JSON.stringify(wire)},`;
  });
  return `// AUTO-GENERATED — do not edit by hand.
// Source: src/generated/event-catalog.json (vendored from the backend's
// domain.event.types.EventType). Regenerate with \`pnpm gen:event-types\`
// after re-syncing the catalog. Drift is guarded by tests/event-catalog.test.ts
// (SDK side) and the webagent-e2e contract suite (vs the live backend enum).

/**
 * INTERNAL — the raw wire event types (the complete mirror of the backend
 * \`EventType\` enum, in canonical order). NOT a public export. Developers use
 * the curated \`QoniEventTypes\` / \`event.type\` (run-events.ts); these raw wire
 * names back the wire→curated mapping, \`event.raw.event\`, and the drift tests.
 */
export const WireEventTypes = {
${entries.join("\n")}
} as const;

export type WireEventType = (typeof WireEventTypes)[keyof typeof WireEventTypes];

/** The wire catalog as a flat, ordered list — used by the drift tests. */
export const WIRE_EVENT_TYPE_VALUES: readonly WireEventType[] =
  Object.values(WireEventTypes);
`;
}

/**
 * Render src/generated/interaction-types.ts from the catalog's discriminator
 * enums (interaction_types / interaction_status / action_kinds, catalog v2).
 * Each becomes a frozen const object (PascalCase member → wire string) plus a
 * typed union, so the curated Interaction surface in src/interactions.ts is
 * generated, not hand-typed, and drift against the backend is test-guarded.
 */
function renderInteractions(catalog) {
  const enums = [
    {
      values: catalog.interaction_types,
      constName: "InteractionTypes",
      typeName: "InteractionType",
      valuesName: "INTERACTION_TYPE_VALUES",
      member: pascalCase,
      doc: "The interaction `type` discriminator — the single field a consumer\n * switches on to pick a card / typed handle.",
    },
    {
      values: catalog.interaction_status,
      constName: "InteractionStatuses",
      typeName: "InteractionStatus",
      valuesName: "INTERACTION_STATUS_VALUES",
      member: pascalCase,
      doc: "Interaction lifecycle status (backend-authoritative):\n * pending → active → resolved | expired | canceled.",
    },
    {
      values: catalog.action_kinds,
      constName: "ActionKinds",
      typeName: "ActionKind",
      valuesName: "ACTION_KIND_VALUES",
      // Action kinds back the typed methods (answer / confirmSignedIn / …), so
      // members are camelCase to read like the method names they drive.
      member: camelCase,
      doc: "Action-contract kinds — what a consumer can do to an interaction.\n * Each maps to a typed method on InteractionHandle.",
    },
  ];

  for (const e of enums) {
    if (!Array.isArray(e.values) || e.values.length === 0) {
      throw new Error(
        `catalog is missing the "${e.constName}" enum — re-sync from a v2 catalog ` +
          "(webagentbackend/docs/events/catalog.json).",
      );
    }
  }

  const blocks = enums.map((e) => {
    const seen = new Set();
    const entries = e.values.map((wire) => {
      const key = e.member(wire);
      if (seen.has(key)) throw new Error(`duplicate ${e.constName} member ${key} (from ${wire})`);
      seen.add(key);
      return `  ${key}: ${JSON.stringify(wire)},`;
    });
    return `/**
 * ${e.doc}
 */
export const ${e.constName} = {
${entries.join("\n")}
} as const;

export type ${e.typeName} = (typeof ${e.constName})[keyof typeof ${e.constName}];

/** Flat, ordered list of every ${e.typeName} wire value — used by drift tests. */
export const ${e.valuesName}: readonly ${e.typeName}[] =
  Object.values(${e.constName});`;
  });

  return `// AUTO-GENERATED — do not edit by hand.
// Source: src/generated/event-catalog.json (vendored from the backend's
// domain.event.types, catalog v2). Regenerate with \`pnpm gen:event-types\`
// after re-syncing the catalog. Drift is guarded by tests/event-catalog.test.ts
// (SDK side) and the webagent-e2e contract suite (vs the live backend enums).
//
// These are the interaction discriminators (run.interaction): the \`type\`,
// \`status\`, and action \`kind\` enums. The curated Interaction surface
// (src/interactions.ts) builds its typed union on top of these.

${blocks.join("\n\n")}
`;
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const rendered = render(catalog);
const renderedInteractions = renderInteractions(catalog);

const check = process.argv.includes("--check");
if (check) {
  let stale = false;
  if (readFileSync(outPath, "utf8") !== rendered) {
    console.error("src/generated/event-types.ts is stale — run `pnpm gen:event-types`.");
    stale = true;
  }
  if (readFileSync(interactionsOutPath, "utf8") !== renderedInteractions) {
    console.error("src/generated/interaction-types.ts is stale — run `pnpm gen:event-types`.");
    stale = true;
  }
  if (stale) process.exit(1);
  console.log("event-types.ts and interaction-types.ts are up to date.");
} else {
  writeFileSync(outPath, rendered);
  console.log(`wrote ${outPath} (${catalog.event_types.length} event types)`);
  writeFileSync(interactionsOutPath, renderedInteractions);
  console.log(
    `wrote ${interactionsOutPath} (${catalog.interaction_types.length} types, ` +
      `${catalog.interaction_status.length} statuses, ${catalog.action_kinds.length} action kinds)`,
  );
}
