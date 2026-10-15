// Reviewer-only probe (scratch copy). Wire card shaped exactly like WA interaction_map FILL_FORM output.
import { expect, it } from "vitest";
import { InteractionHandle, normalizeInteraction } from "../src/interactions";

const wire = {
  id: "F", type: "fill_form", status: "pending", created_at: "2026-10-08T00:00:00Z", title: "Delivery", prompt: "Delivery", description: null,
  fields: [{ name: "item_count", label: "Count", type: "number", required: true }, { name: "postal_code", label: "PC", type: "text" }],
  actions: [{ kind: "submit", label: "Submit", endpoint: "/do_anything/runs/r/interactions/F/submit",
    input_schema: { type: "object", required: ["values"], additionalProperties: false, properties: { values: {
      type: "object", required: ["item_count"], additionalProperties: false,
      properties: { item_count: { type: "number" }, postal_code: { type: "string" }, address: { type: "object", properties: { street_name: {type: "string"} }, required: ["street_name"] } } } } } },
    { kind: "skip", label: "Skip", endpoint: "/do_anything/runs/r/interactions/F/skip" }],
};

it("keeps declared submit schema property names identical to required field names", async () => {
  const i = normalizeInteraction(wire)!;
  const fields = (i.payload as any).fields;
  const schema = (i.actions[0] as any).inputSchema.properties.values;
  console.log(JSON.stringify({ fieldNames: fields.map((f: any) => f.name), schemaKeys: Object.keys(schema.properties), schemaRequired: schema.required, description: (i.payload as any).description }));
  expect(fields.map((f: any) => f.name)).toEqual(["item_count", "postal_code"]);
  const sent: unknown[] = [];
  await new InteractionHandle(i, async (_a, body) => { sent.push(body); }).submit({ item_count: 0 });
  expect(sent).toEqual([{ values: { item_count: 0 } }]);
  // Preserve user-defined property names in the exposed inputSchema.
  expect(Object.keys(schema.properties)).toEqual(["item_count", "postal_code", "address"]);
  expect(schema.properties.address.properties).toEqual({street_name:{type:"string"}});
  expect(schema.properties.address.required).toEqual(["street_name"]);
  expect(schema.required).toEqual(["item_count"]);
});

it("rejects whitespace, explicit null Profile declarations and unsafe typed integers, preserves finite decimals and strings", async () => {
 const base = {...wire, fields:[{name:"note", label:"Note", type:"text", required:true},{name:"address",label:"Address",type:"address"},{name:"n",label:"Number",type:"number"}]};
 const sent:unknown[]=[]; const handle=new InteractionHandle(normalizeInteraction(base)!,async (_a,b)=>{sent.push(b)});
 await expect(handle.submit({note:"   "})).rejects.toThrow();
 await expect(handle.submit({note:"x",address:{line1:"  "}})).rejects.toThrow();
 await expect(handle.submit({note:"x",n:Number.MAX_SAFE_INTEGER+1})).rejects.toThrow();
 await handle.submit({note:" x ",n:0.25,address:{line1:" Main "}});
 expect(sent).toEqual([{values:{note:" x ",n:0.25,address:{line1:" Main "}}}]);
 for (const key of ["profileField","profile_field"]) {
  const h=new InteractionHandle(normalizeInteraction({...base,fields:[{name:"note",label:"Note",type:"text",[key]:null}]})!,async()=>{});
  await expect(h.submit({note:"x"})).rejects.toThrow();
 }
 const ask=new InteractionHandle(normalizeInteraction({id:"N",type:"clarification",status:"pending",answer_type:"number",actions:[{kind:"answer",endpoint:"/answer"}]})!,async()=>{});
 await expect(ask.answer(Number.MAX_SAFE_INTEGER+1)).rejects.toThrow();
 await ask.answer(0.25);
});
