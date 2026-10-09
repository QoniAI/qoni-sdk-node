import { QoniValidationError } from "./errors";
import type { AskUserOption } from "./interactions";
import type { JsonObject } from "./types";

/** Ordinary fields collect an answer for this task. Sensitive/Profile fields are unavailable. */
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "date" | "select" | "address";
  required?: boolean;
  options?: AskUserOption[];
  sensitive?: false;
  profileField?: never;
}
export interface FormAddress {
  line1: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}
export type FormValues = Record<string, string | number | FormAddress>;
export interface FillFormPayload {
  title: string;
  description?: string;
  fields: FormField[];
}

const FIELD_TYPES = new Set(["text", "email", "phone", "number", "date", "select", "address"]);
const ADDRESS_KEYS = new Set(["line1", "line2", "city", "region", "postalCode", "country"]);
function fail(): never { throw new QoniValidationError("submit() expects the current ordinary fields, required values, types and option values; sensitive and Profile fields are unavailable"); }
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

/** No coercion or rejected-value echo. The backend repeats validation on its durable card. */
export function checkForm(fields: FormField[], values: unknown): asserts values is FormValues & JsonObject {
  if (!Array.isArray(fields) || fields.length < 1 || fields.length > 20 || !object(values)) fail();
  const names = new Set<string>();
  for (const field of fields) {
    const raw = field as FormField & Record<string, unknown>;
    if (!object(raw) || !FIELD_TYPES.has(raw.type) || typeof raw.name !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(raw.name) || names.has(raw.name) ||
        (raw.sensitive !== undefined && raw.sensitive !== false) || Object.hasOwn(raw, "profileField") || Object.hasOwn(raw, "profile_field") ||
        (raw.required !== undefined && typeof raw.required !== "boolean")) fail();
    names.add(raw.name);
    if (!Object.hasOwn(values, raw.name)) { if (raw.required) fail(); else continue; }
    const value = values[raw.name];
    if (raw.type === "number") {
      if (typeof value !== "number" || (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))) fail();
    } else if (raw.type === "address") {
      if (!object(value) || typeof value.line1 !== "string" || value.line1.trim().length === 0 ||
          Object.entries(value).some(([key, item]) => !ADDRESS_KEYS.has(key) || typeof item !== "string" || item.includes("\0"))) fail();
    } else {
      if (typeof value !== "string" || value.includes("\0") || (raw.required && raw.type !== "select" && !value.trim().length)) fail();
      if (raw.type === "select" && (!Array.isArray(raw.options) || !raw.options.length || !raw.options.some((option) => option.value === value))) fail();
    }
  }
  if (Object.keys(values).some((name) => !names.has(name))) fail();
}
