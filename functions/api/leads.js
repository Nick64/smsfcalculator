/**
 * POST /api/leads
 *
 * Captures a lead and:
 *   1. Stores it in Cloudflare KV (binding: LEADS) — if configured
 *   2. Forwards to webhook URL (env: LEAD_WEBHOOK_URL) — if configured
 *
 * Both are optional but at least one should be set in production.
 *
 * Body: { name, email, phone, consent, trigger, summary, submittedAt }
 *
 * Cloudflare KV storage and Pages Functions are documented at:
 *   https://developers.cloudflare.com/pages/functions/
 *   https://developers.cloudflare.com/kv/
 */

export async function onRequestPost({ request, env }) {
  const cors = corsHeaders(request);

  // Handle CORS preflight (rare on same-origin but safe)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, cors);
  }

  // Basic validation
  const errors = validate(body);
  if (errors.length > 0) {
    return jsonResponse({ error: "Validation failed", details: errors }, 400, cors);
  }

  // Spam guard — basic honeypot/throttle would go here.
  // For now: reject if email is obviously fake.
  if (!isValidEmail(body.email)) {
    return jsonResponse({ error: "Invalid email" }, 400, cors);
  }

  const lead = {
    id: crypto.randomUUID(),
    name: sanitize(body.name),
    email: sanitize(body.email).toLowerCase(),
    phone: sanitize(body.phone || ""),
    consent: !!body.consent,
    trigger: sanitize(body.trigger || "unknown"),
    summary: body.summary || {},
    submittedAt: body.submittedAt || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "",
    ip: request.headers.get("cf-connecting-ip") || "",
    country: request.cf?.country || "",
  };

  // Store in KV (if configured)
  if (env.LEADS) {
    try {
      // Store under two keys: by ID and indexed by date
      await env.LEADS.put(`lead:${lead.id}`, JSON.stringify(lead), {
        // Index for 2 years
        expirationTtl: 60 * 60 * 24 * 365 * 2,
      });
      // Date-indexed key for easier listing
      const dateKey = lead.receivedAt.slice(0, 10);
      await env.LEADS.put(`date:${dateKey}:${lead.id}`, lead.id, {
        expirationTtl: 60 * 60 * 24 * 365 * 2,
      });
    } catch (err) {
      console.error("KV write failed:", err);
      // Don't fail the request — webhook may still succeed
    }
  }

  // Forward to webhook (if configured)
  if (env.LEAD_WEBHOOK_URL) {
    try {
      // Fire and forget — don't block the response
      const webhookPromise = fetch(env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "EWC-SMSF-Calculator/1.0",
        },
        body: JSON.stringify(lead),
      });
      // Wait for webhook with a 5s ceiling so we don't hang
      await Promise.race([
        webhookPromise,
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch (err) {
      console.error("Webhook forward failed:", err);
    }
  }

  return jsonResponse({ success: true, leadId: lead.id }, 200, cors);
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// ---- Helpers ----

function validate(body) {
  const errors = [];
  if (!body.name || typeof body.name !== "string" || body.name.length < 2) {
    errors.push("Name is required");
  }
  if (!body.email || typeof body.email !== "string") {
    errors.push("Email is required");
  }
  if (body.name && body.name.length > 200) errors.push("Name too long");
  if (body.email && body.email.length > 200) errors.push("Email too long");
  if (body.phone && body.phone.length > 50) errors.push("Phone too long");
  return errors;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, 500).replace(/[<>]/g, "");
}

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}
