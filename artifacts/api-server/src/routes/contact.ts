import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";

const router = Router();

// ── Rate limiting ──────────────────────────────────────────
const perMinute = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute before trying again." },
});

const perHour = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Hourly limit reached. Please try again later." },
});

// ── Validation schema ──────────────────────────────────────
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  category: z.enum([
    "MCA funder",
    "Factor",
    "Equipment lessor",
    "Lender",
    "Law firm",
    "Other",
  ]),
  balance: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long"),
  website: z.string().optional(), // honeypot
});

// ── Email sender ───────────────────────────────────────────
async function sendEmail(payload: {
  to: string;
  replyTo: string;
  subject: string;
  body: string;
}): Promise<{ id?: string }> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // TODO: switch to noreply@advancedrecoverygroup.com after domain verification
      from: "ARG Website <onboarding@resend.dev>",
      to: [payload.to],
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.body,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "(unreadable)");
    throw new Error(`Resend returned ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<{ id?: string }>;
}

function getEtTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "full",
    timeStyle: "long",
  });
}

// ── POST /api/contact ──────────────────────────────────────
router.post("/contact", perMinute, perHour, async (req, res) => {
  // Parse + validate
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "unknown";
      if (!fields[key]) fields[key] = issue.message;
    }
    res.status(400).json({ error: "Validation failed", fields });
    return;
  }

  const data = parsed.data;

  // Honeypot check — silently discard spam
  if (data.website && data.website.length > 0) {
    logger.info({ ip: req.ip }, "Honeypot triggered — discarding submission");
    res.status(200).json({ ok: true });
    return;
  }

  // Build email body
  const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
  const body = [
    `WEBSITE INQUIRY`,
    `=====================================`,
    ``,
    `Name:     ${data.name}`,
    `Company:  ${data.company}`,
    `Email:    ${data.email}`,
    `Phone:    ${data.phone || "(not provided)"}`,
    `Category: ${data.category}`,
    `Balance:  ${data.balance || "(not specified)"}`,
    ``,
    `Message:`,
    `-------------------------------------`,
    data.message,
    ``,
    `=====================================`,
    `Submitted: ${getEtTimestamp()}`,
    `Source IP: ${ip}`,
  ].join("\n");

  try {
    const result = await sendEmail({
      to: "collect@advancedrecoverygroup.com",
      replyTo: data.email,
      subject: `Website inquiry — ${data.company}`,
      body,
    });
    logger.info({ resendId: result.id, company: data.company }, "Contact form email sent");
    res.status(200).json({ ok: true, id: result.id });
  } catch (err) {
    logger.error({ err }, "Failed to send contact form email via Resend");
    res.status(502).json({ error: "delivery_failed" });
  }
});

export default router;
