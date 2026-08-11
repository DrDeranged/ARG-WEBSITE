/**
 * ArgAssist — ARG AI Placement Concierge
 * Right-side ledger sheet. Slides in from right with translateX.
 * Streams responses from /api/assist (SSE).
 * Handoff packages conversation into sessionStorage for the contact form.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMotion } from '@/motion';

/* ── Types ─────────────────────────────────────────────────────────────── */
type Role = 'user' | 'assistant';

interface Turn {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
  error?: boolean;
  ts: Date;
}

type StreamEvent =
  | { text: string; done?: undefined; error?: undefined }
  | { done: true; text?: undefined; error?: undefined }
  | { error: string; text?: undefined; done?: undefined };

const API_BASE = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/* ── Quick-start chips ──────────────────────────────────────────────────── */
const QUICK_CHIPS = [
  'What do you need to place a file?',
  'How does contingency work?',
  'What industries do you serve?',
  'How fast can you start?',
] as const;

/* ── SSE streaming helper ───────────────────────────────────────────────── */
async function streamAssist(
  messages: Array<{ role: Role; content: string }>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
  signal: AbortSignal,
) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    throw err;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const payload = JSON.parse(line.slice(6)) as StreamEvent;
        if ('error' in payload && payload.error) { onError(payload.error); return; }
        if ('done' in payload && payload.done)   { onDone(); return; }
        if ('text' in payload && payload.text)   { onChunk(payload.text); }
      } catch { /* skip malformed lines */ }
    }
  }
  onDone();
}

/* ── Helpers ────────────────────────────────────────────── */
function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

let turnIdCounter = 0;
const genId = () => `t${++turnIdCounter}`;

const DISCLOSURE: Turn = {
  id: 'disclosure',
  role: 'assistant',
  content:
    "I'm ARG Assist, an AI placement concierge. I can help you understand our process and prepare your file for placement — but I can't give legal advice or quote fees. A specialist handles those. How can I help?",
  ts: new Date(),
};

/* ── Individual turn row ────────────────────────────────────────────────── */
function TurnRow({ turn, reducedMotion }: { turn: Turn; reducedMotion: boolean }) {
  const isUser = turn.role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 px-5 py-4">
        <div className="max-w-[85%] bg-mist/60 border border-rule px-4 py-2.5 rounded-sm">
          <p className="font-mono text-sm text-ink whitespace-pre-wrap break-words leading-relaxed">
            {turn.content}
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate/40 tabular-nums pr-0.5">
          {fmtTime(turn.ts)}
        </span>
      </div>
    );
  }

  /* Assistant turn */
  return (
    <div className="flex flex-col gap-1 px-5 py-4 border-l-2 border-l-ink/10 ml-0">
      <div className="max-w-full">
        {turn.error ? (
          /* Error turn — calm ledger row, no red */
          <p className="font-mono text-[13px] text-slate leading-relaxed">
            {turn.content}{' '}
            <a href="tel:8774648470" className="text-recovered underline underline-offset-2 hover:text-recovered/80 transition-colors">
              (877) 464-8470
            </a>
            {' or '}
            <a href="mailto:collect@advancedrecoverygroup.com" className="text-recovered underline underline-offset-2 hover:text-recovered/80 transition-colors">
              collect@
            </a>
          </p>
        ) : (
          <p className="font-serif text-[15px] text-ink leading-relaxed whitespace-pre-wrap break-words">
            {turn.content}
            {turn.streaming && !reducedMotion && (
              <span className="animate-pulse text-recovered ml-[1px] font-mono text-sm select-none" aria-hidden="true">|</span>
            )}
          </p>
        )}
      </div>
      {turn.id !== 'disclosure' && (
        <span className="font-mono text-[10px] text-slate/40 tabular-nums">
          {fmtTime(turn.ts)}
        </span>
      )}
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */
export function ArgAssist({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate]  = useLocation();
  const { reducedMotion } = useMotion();
  const [turns, setTurns]   = useState<Turn[]>([DISCLOSURE]);
  const [input, setInput]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [anim, setAnim]     = useState(false);
  const [mounted, setMounted] = useState(false);
  const [handoffMsg, setHandoffMsg] = useState('');
  const abortRef    = useRef<AbortController | null>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);

  const hasRealTurns = turns.filter(t => t.id !== 'disclosure').length > 0;

  /* ── Open / close animation ─────────────────────────────────────────── */
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Double RAF: ensure DOM is present before slide-in begins
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
      return;
    } else {
      setAnim(false);
      const timer = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* ── Escape key ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* ── Auto-scroll to bottom ──────────────────────────────────────────── */
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns]);

  /* ── Focus input on open ────────────────────────────────────────────── */
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open]);

  /* ── Abort on unmount ───────────────────────────────────────────────── */
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  /* ── Send message ───────────────────────────────────────────────────── */
  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const userTurn: Turn = { id: genId(), role: 'user', content: trimmed, ts: new Date() };
    const assistTurn: Turn = { id: genId(), role: 'assistant', content: '', streaming: true, ts: new Date() };

    setTurns(prev => [...prev, userTurn, assistTurn]);
    setInput('');
    setBusy(true);

    const history = turns
      .filter(t => t.id !== 'disclosure')
      .map(t => ({ role: t.role, content: t.content }));
    history.push({ role: 'user', content: trimmed });

    try {
      await streamAssist(
        history,
        (chunk) => {
          setTurns(prev =>
            prev.map(t => t.id === assistTurn.id ? { ...t, content: t.content + chunk } : t)
          );
        },
        () => {
          setTurns(prev =>
            prev.map(t => t.id === assistTurn.id ? { ...t, streaming: false } : t)
          );
          setBusy(false);
        },
        (errMsg) => {
          setTurns(prev =>
            prev.map(t =>
              t.id === assistTurn.id
                ? { ...t, content: errMsg, streaming: false, error: true }
                : t
            )
          );
          setBusy(false);
        },
        ctrl.signal,
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') { setBusy(false); return; }
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setTurns(prev =>
        prev.map(t =>
          t.id === assistTurn.id
            ? { ...t, content: msg, streaming: false, error: true }
            : t
        )
      );
      setBusy(false);
    }
  }, [busy, turns]);

  /* ── Chip send ──────────────────────────────────────────────────────── */
  const sendChip = useCallback((chip: string) => {
    void send(chip);
  }, [send]);

  /* ── Textarea key handler ───────────────────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  /* ── Handoff to contact form ────────────────────────────────────────── */
  const handleHandoff = () => {
    const payload = turns
      .filter(t => t.id !== 'disclosure')
      .map(t => `[${t.role.toUpperCase()}] ${t.content}`)
      .join('\n\n');
    sessionStorage.setItem('arg:assist-handoff', payload);
    setHandoffMsg('Conversation sent — redirecting…');
    setTimeout(() => {
      onClose();
      navigate('/contact-us/');
      setHandoffMsg('');
    }, 800);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[79] bg-ink/30 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: anim ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ARG Assist — AI Placement Concierge"
        className="fixed inset-y-0 right-0 z-[80] w-full md:w-[460px] bg-paper flex flex-col border-l border-rule"
        style={{
          transform: anim ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(.22,1,.36,1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <header
          className="bg-ink flex-shrink-0"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] tracking-[0.22em] text-paper uppercase">
                ARG ASSIST
              </p>
              <p className="font-serif text-[1.05rem] text-paper leading-snug mt-0.5">
                AI Placement Concierge
              </p>
              <p className="font-mono text-[10px] text-paper/50 mt-1 leading-relaxed">
                Not legal advice — fees &amp; odds require a specialist.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close ARG Assist"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-paper/60 hover:text-paper transition-colors flex-shrink-0 -mr-2"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-[1px] bg-paper/10 mx-0" />
        </header>

        {/* ── Conversation ──────────────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
          {/* Quick-start chips — hidden once real turns exist */}
          {!hasRealTurns && (
            <div className="px-5 py-4 flex flex-wrap gap-2 border-b border-rule">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => sendChip(chip)}
                  disabled={busy}
                  className="font-mono text-[10px] border border-rule px-3 py-2 text-slate hover:text-recovered hover:border-recovered hover:bg-mist/40 active:bg-mist/60 transition-all rounded-sm text-left disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Turns list */}
          <div className="flex flex-col">
            {turns.map(turn => (
              <TurnRow key={turn.id} turn={turn} reducedMotion={reducedMotion} />
            ))}
          </div>
        </div>

        {/* ── Handoff footer ────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-rule px-5 py-2">
          {handoffMsg ? (
            <p className="font-mono text-[10px] text-recovered tracking-widest py-1">
              {handoffMsg}
            </p>
          ) : (
            <button
              onClick={handleHandoff}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-slate hover:text-recovered transition-colors w-full py-1.5 text-left group"
            >
              <ArrowRight
                size={11}
                className="group-hover:translate-x-0.5 transition-transform"
              />
              Send to a Specialist
            </button>
          )}
        </div>

        {/* ── Input ────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-rule px-4 py-3 flex gap-2 items-end bg-paper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // Auto-grow: reset then re-apply
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={busy}
            placeholder="Ask about placement, process, or documents…"
            rows={1}
            className="flex-1 resize-none font-mono text-sm text-ink placeholder:text-slate/40 bg-transparent outline-none min-h-[40px] max-h-[120px] py-2 leading-relaxed disabled:opacity-50"
            aria-label="Message ARG Assist"
          />
          <button
            onClick={() => void send(input)}
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex items-center justify-center min-w-[40px] min-h-[40px] text-slate hover:text-recovered disabled:opacity-30 transition-colors flex-shrink-0"
          >
            {busy ? (
              <svg className="w-4 h-4 animate-spin text-recovered" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
