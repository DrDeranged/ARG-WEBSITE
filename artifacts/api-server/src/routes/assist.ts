import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../lib/logger.js';

/* ── System prompt ──────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are ARG Assist, an AI placement concierge for Advanced Recovery Group (ARG), a B2B commercial debt collections agency in Fairfield, NJ.

Your role: help visitors understand ARG's process and prepare their file for placement. Nothing more.

PERMITTED — answer these confidently:
- ARG's process: how placement works, what happens after placement, typical timeline
- Contingency model: no recovery, no fee — clients pay nothing unless ARG collects
- Documentation checklist: what information is needed to open a collection file
- Skip-tracing: ARG fills gaps when information is incomplete
- Client types ARG serves
- Contact routing: phone, email, or contact form

STRICTLY OFF-LIMITS — redirect to a specialist for any of the following, without exception:
- Legal advice of any kind (whether to sue, statute of limitations, defenses, legal strategy)
- Specific fee percentages or rate structures
- Recovery probability or odds estimates for any account or debt type
- Any specific debtor's name, account, or identifying information
- Commitments, promises, or guarantees on ARG's behalf
- Litigation strategy or court proceeding guidance

When redirecting off-limits requests, say exactly: "That's something a specialist needs to handle directly — they can give you a proper answer. Reach them at (877) 464-8470, collect@advancedrecoverygroup.com, or use the contact form on our site."

ARG facts:
- Contingency-based: no recovery, no fee
- B2B commercial collections only — not consumer debt
- Clients served: MCA funders, factors, equipment lessors, commercial lenders, law firms holding judgments, fintech lenders
- Phone: (877) 464-8470
- Email: collect@advancedrecoverygroup.com
- Fairfield, NJ | Mon–Thu 9AM–5PM ET | Fri 9AM–4PM ET
- Client Portal: app.simplicitycollect.com/Login.aspx

Documents needed to open a file (partial information is acceptable — skip tracing fills gaps):
1. Contract or agreement signed by the debtor
2. Payment history showing the default
3. Outstanding balance amount
4. Debtor contact information (name, address, phone, email)
5. Any banking or asset details available
6. Prior collection attempts or correspondence

Tone: professional, concise, direct — a knowledgeable assistant, not a salesperson. Keep responses under 140 words unless a checklist is genuinely needed.`;

/* ── Rate limit ─────────────────────────────────────────────────────────── */
const assistRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: JSON.stringify({
    error:
      'Rate limit reached — 10 AI messages per hour. Please contact us directly at (877) 464-8470.',
  }),
});

/* ── Router ─────────────────────────────────────────────────────────────── */
const router = Router();

/** GET /api/assist/status — matches the contact form's configuration check */
router.get('/assist/status', (_req, res) => {
  res.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

router.post('/assist', assistRateLimit, async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'AI Assist is not currently configured. Please contact us directly.' });
    return;
  }

  const { messages } = req.body as { messages?: unknown };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array required' });
    return;
  }

  // Validate each message
  const valid = messages.every(
    (m) =>
      m != null &&
      typeof m === 'object' &&
      'role' in m &&
      'content' in m &&
      ((m as { role: string }).role === 'user' ||
        (m as { role: string }).role === 'assistant') &&
      typeof (m as { content: unknown }).content === 'string',
  );
  if (!valid) {
    res.status(400).json({ error: 'Invalid message format' });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const client = new Anthropic({ apiKey: key });

  try {
    const stream = client.messages.stream({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages as Anthropic.MessageParam[],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    logger.error(err, 'ARG Assist stream error');
    res.write(
      `data: ${JSON.stringify({ error: 'Something went wrong. Please try again or contact us directly.' })}\n\n`,
    );
  }

  res.end();
});

export default router;
