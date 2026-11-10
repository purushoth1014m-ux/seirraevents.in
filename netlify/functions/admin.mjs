import { getStore } from "@netlify/blobs";
import { timingSafeEqual, createHash } from "node:crypto";
// Default login works right after deploy. To use your own password, set ADMIN_PASSWORD in Netlify environment variables (it overrides this).
const DEFAULT_HASH = "35a547421820b2dd810c3a4d8d70c6505b2e9f2e34aa28eb04cba1deb2ce7978";
const STATUS = ["New", "Contacted", "Quoted", "Won", "Lost"];
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
const eq = (a, b) => a.length === b.length && timingSafeEqual(a, b);
const authed = (req) => {
  const a = req.headers.get("x-admin-password") || "";
  if (!a) return false;
  const env = process.env.ADMIN_PASSWORD;
  if (env) return eq(Buffer.from(a), Buffer.from(env));
  return eq(createHash("sha256").update(a).digest(), Buffer.from(DEFAULT_HASH, "hex"));
};
const all = async (store) => {
  const { blobs } = await store.list();
  const rows = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
  return rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};
const csv = (rows) => {
  const cols = ["enquiry_id","created_at","status","owner","name","phone","email","event_type","event_date","duration","location","city","setting","scope","budget","design_code","theme","guests","recurring","message"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => q(r[c])).join(","))].join("\n");
};

export default async (req) => {
  if (!authed(req)) { await new Promise((r) => setTimeout(r, 500)); return json({ error: "Wrong password." }, 401); }
  const store = getStore("enquiries");
  if (req.method === "GET") {
    const rows = await all(store);
    if (new URL(req.url).searchParams.get("csv"))
      return new Response(csv(rows), { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=sierra-enquiries.csv" } });
    return json({ rows });
  }
  if (req.method === "POST") {
    let d; try { d = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
    const rec = await store.get(String(d.id), { type: "json" });
    if (!rec) return json({ error: "Not found" }, 404);
    if (STATUS.includes(d.status)) rec.status = d.status;
    rec.owner = String(d.owner ?? "").slice(0, 60);
    await store.setJSON(rec.enquiry_id, rec);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
};
export const config = { path: "/api/admin" };
