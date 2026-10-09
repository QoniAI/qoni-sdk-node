import { describe, expect, it, expectTypeOf } from "vitest";
import { InteractionHandle, normalizeInteraction } from "../src/interactions";
import { QoniValidationError, type Interaction, type FormField, type FormValues } from "../src";

const fields = [
  { name: "item_count", label: "Count", type: "number", required: true },
  { name: "method", label: "Method", type: "select", options: [{ value: "ship", label: "Ship" }], required: true },
  { name: "address", label: "Address", type: "address", required: true },
  { name: "note", label: "Note", type: "text" },
];
const values = { item_count: 0, method: "ship", address: { line1: "Synthetic road", postalCode: "000000" }, note: "" };
function form() {
  return normalizeInteraction({ id: "form-1", type: "fill_form", status: "pending", created_at: "2026-10-08T00:00:00Z", title: "Delivery", description: "Synthetic", fields,
    actions: [{ kind: "submit", label: "Submit", endpoint: "/do_anything/runs/r/interactions/form-1/submit" }, { kind: "skip", label: "Skip", endpoint: "/skip" }] })!;
}

describe("ordinary fill_form", () => {
  it("normalizes fields and posts JSON values without changing application keys", async () => {
    const interaction = form();
    expect(interaction.type).toBe("fill_form");
    expect(interaction.payload).toEqual({ title: "Delivery", description: "Synthetic", fields });
    const sent: unknown[] = [];
    const handle = new InteractionHandle(interaction, async (action, body) => { sent.push([action.endpoint, body]); });
    await handle.submit(values);
    expect(sent).toEqual([["/do_anything/runs/r/interactions/form-1/submit", { values }]]);
  });
  it.each([
    { ...values, extra: "x" }, { ...values, item_count: true }, { ...values, item_count: Infinity },
    { ...values, method: "Ship" }, { ...values, address: { line1: "x", extra: "x" } },
    { ...values, address: { line1: "x\0" } }, { method: "ship", address: values.address },
  ])("rejects invalid field values before transport", async (invalid) => {
    let sent = 0;
    const handle = new InteractionHandle(form(), async () => { sent++; });
    await expect(handle.submit(invalid)).rejects.toBeInstanceOf(QoniValidationError);
    expect(sent).toBe(0);
  });
  it.each([{ type: "payment_card" }, { sensitive: true }, { profile_field: "name" }])("blocks unavailable sensitive or persistent fields", async (patch) => {
    const interaction = form();
    (interaction.payload as any).fields[0] = { ...fields[0], ...patch };
    let sent = 0;
    await expect(new InteractionHandle(interaction, async () => { sent++; }).submit(values)).rejects.toBeInstanceOf(QoniValidationError);
    expect(sent).toBe(0);
  });
  it("adds the narrowed public form type", () => {
    const i = form() as Interaction;
    if (i.type === "fill_form") expectTypeOf(i.payload.fields).toEqualTypeOf<FormField[]>();
    expectTypeOf<FormValues>().toMatchTypeOf<Record<string, unknown>>();
  });
});

it("a required select may submit its declared empty option value", async () => {
  const interaction = form();
  (interaction.payload as any).fields[1].options = [{value:"",label:"No delivery"}];
  const sent: unknown[] = [];
  await new InteractionHandle(interaction, async (_action, body) => {sent.push(body);}).submit({...values,method:""});
  expect(sent).toEqual([{values:{...values,method:""}}]);
});
