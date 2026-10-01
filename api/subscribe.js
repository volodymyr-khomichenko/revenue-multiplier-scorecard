// api/subscribe.js — Vercel serverless function for the Revenue Multiplier Scorecard
// -----------------------------------------------------------------------------
// Forwards the scorecard email + result to MailerLite. The secret API key lives
// ONLY here (as an environment variable), never in the public widget.
//
// Deploy: this file lives at /api/subscribe.js in the Vercel project; the widget's
// SUBSCRIBE_ENDPOINT is then "/api/subscribe".
//
// Required environment variables (Vercel → Project → Settings → Environment Variables):
//   MAILERLITE_API_KEY   MailerLite → Integrations → API → generate a token
//   MAILERLITE_GROUP_ID  the group new leads should join (see SETUP.md)
// -----------------------------------------------------------------------------

export default async function handler(req, res) {
  // CORS (safe if the widget is embedded on a different domain than this function)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  const KEY = process.env.MAILERLITE_API_KEY;
  const GROUP = process.env.MAILERLITE_GROUP_ID;
  if (!KEY) { res.status(500).json({ error: "MAILERLITE_API_KEY is not set" }); return; }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { email, consent, build, multiplier, archetype, level, weak, flags } = body || {};

  // Require explicit consent — matches the checkbox in the widget.
  if (!email || consent !== true) {
    res.status(400).json({ error: "email and consent are required" });
    return;
  }

  // Custom fields carry the result so a MailerLite automation can personalise the
  // email. Create these fields in MailerLite → Subscribers → Fields first (see SETUP.md).
  const payload = {
    email,
    fields: {
      rm_build: build != null ? String(build) : "",
      rm_multiplier: multiplier != null ? "x" + multiplier : "",
      rm_archetype: archetype || "",
      rm_level: level || "",
      rm_weak: Array.isArray(weak) ? weak.join(", ") : "",
      rm_flags: flags != null ? String(flags) : "0"
    }
  };
  if (GROUP) payload.groups = [GROUP];

  try {
    const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer " + KEY
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: "MailerLite rejected the request", status: r.status, detail });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ error: "Could not reach MailerLite", detail: String(e) });
  }
}
