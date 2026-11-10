import { getStore } from "@netlify/blobs";
const clean = (v, n = 200) => String(v ?? "").trim().slice(0, n);
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  let d; try { d = await req.json(); } catch { return json({ ok: false, error: "Invalid request" }, 400); }
  if (d["bot-field"]) return json({ ok: true, enquiry_id: "-" });

  const phone = clean(d.phone, 30).replace(/[^\d+]/g, "");
  const email = clean(d.email, 120);
  if (!clean(d.name, 80)) return json({ ok: false, error: "Enter your name." }, 400);
  if (!/^\+?\d{8,15}$/.test(phone)) return json({ ok: false, error: "Enter a valid mobile number." }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: "Enter a valid email address." }, 400);
  if (!clean(d.event_type)) return json({ ok: false, error: "Choose an event type." }, 400);
  if (!d.consent) return json({ ok: false, error: "Please tick the contact consent box." }, 400);

  const year = new Date().getFullYear();
  const meta = getStore("meta");
  const n = Number((await meta.get(`counter-${year}`)) || 0) + 1;
  await meta.set(`counter-${year}`, String(n));
  const id = `SE-Q-${year}-${String(n).padStart(4, "0")}`;

  await getStore("enquiries").setJSON(id, {
    enquiry_id: id, name: clean(d.name, 80), phone, email,
    event_type: clean(d.event_type), event_date: clean(d.event_date, 10), duration: clean(d.duration),
    location: clean(d.location), city: clean(d.city), setting: clean(d.setting), scope: clean(d.scope), budget: clean(d.budget),
    design_code: clean(d.design_code, 20).toUpperCase(), theme: clean(d.theme), guests: clean(d.guests, 10),
    message: clean(d.message, 1500), recurring: !!d.recurring,
    status: "New", owner: "", created_at: new Date().toISOString(),
  });
  return json({ ok: true, enquiry_id: id });
};
export const config = { path: "/api/enquiry" };
