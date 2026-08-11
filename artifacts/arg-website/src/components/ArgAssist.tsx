/**
 * ArgAssist — ARG AI Placement Concierge
 * Right-side ledger sheet. Slides in over a backdrop.
 * Streams responses from /api/assist (SSE).
 * "Send to specialist" packages the conversation into the contact form via sessionStorage.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

/* ── Types ─────────────────────────────────────────────────────────────── */
type Role = 'user' | 'assistant';

interface Turn {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
  ts: Date;
}

type StreamEvent =
  | { text: string; done?: undefined; error?: undefined }
  | { done: true; text?: undefined; error?: undefined }
  | { error: string; text?: undefined; done?: undefined };

const API_BASE = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

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

const DISCLOSURE: Turn = {
  id: 'disclosure',
  role: 'assistant',
  content:
    "I'm ARG Assist, an AI placement concierge. I can help you understand our process and prepare your file for placement — but I can't give legal advice or quote fees. A specialist handles those. How can I help?",
  ts: new Date(),
};

/* ── Component ──────────────────────────────────────────────────────────── */
export function ArgAssist({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate] = useLocation();
  const [turns, setTurns]   = useState<Turn[]>([DISCLOSURE]);
  const [input, setInput]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [anim, setAnim]     = useState(false);
  const abortRef  = useRef<AbortController | null>(null);
  const listRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(false);

  /* ── Animate in/out ─── */
  useEffect(() => {
    if (open) {
      mountedRef.current = true;
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
      setTimeout(() => inputRef.current?.focus(), 320);
    } else {
      setAnim(false);
    }
  }, [open]);

  /* ── Auto-scroll on new content ─── */
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [turns]);

  /* ── Escape key ─── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  /* ── Send ─────────────────────────────────────────────── */
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userTurn: Turn   = { id: `u-${Date.now()}`, role: 'user',      content: text, ts: new Date() };
    const assistTurn: Turn = { id: `a-${Date.now()}`, role: 'assistant', content: '',   streaming: true, ts: new Date() };

    setInput('');
    setBusy(true);
    setTurns(prev => [...prev, userTurn, assistTurn]);

    // History excludes disclosure — it's seeded by the system prompt instead
    const history = [...turns, userTurn]
      .filter(t => t.id !== 'disclosure')
      .map(t => ({ role: t.role, content: t.content }));

    const ctrl = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ctrl;

    try {
      await streamAssist(
        history,
        (chunk) =>
          setTurns(prev =>
            prev.map(t =>
              t.id === assistTurn.id ? { ...t, content: t.content + chunk } : t,
            ),
          ),
        () => {
          setTurns(prev =>
            prev.map(t => t.id === assistTurn.id ? { ...t, streaming: false } : t),
          );
          setBusy(false);
        },
        (errMsg) => {
          setTurns(prev =>
            prev.map(t =>
              t.id === assistTurn.id ? { ...t, content: errMsg, streaming: false } : t,
            ),
          );
          setBusy(false);
        },
        ctrl.signal,
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = (err as Error).message || 'Something went wrong. Please try again.';
      setTurns(prev =>
        prev.map(t =>
          t.id === assistTurn.id ? { ...t, content: msg, streaming: false } : t,
        ),
      );
      setBusy(false);
    }
  }, [input, busy, turns]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  /* ── Handoff to contact form ────────────────────────── */
  const handleHandoff = () => {
    const realTurns = turns.filter(t => t.id !== 'disclosure');
    if (realTurns.length > 0) {
      const body = realTurns
        .map(t => `${t.role === 'user' ? 'INQUIRY' : 'ARG ASSIST'}: ${t.content}`)
        .join('\n\n');
      sessionStorage.setItem('arg:assist-handoff', body);
    }
    onClose();
    navigate('/contact-us/');
  };

  const hasRealTurns = turns.some(t => t.id !== 'disclosure');

  // Keep in DOM while animating out so the slide-out plays
  if (!open && !anim && !mountedRef.current) return null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[79] bg-ink/30 backdrop-blur-sm"
        style={{
          opacity:    anim ? 1 : 0,
          transition: 'opacity 250ms ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* ── Sheet ─────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ARG Assist — AI Placement Concierge"
        className="fixed top-0 right-0 h-dvh z-[80] w-full md:w-[460px] bg-paper border-l border-rule flex flex-col"
        style={{
          transform:    anim ? 'translateX(0)' : 'translateX(100%)',
          transition:   'transform 300ms cubic-bezier(.22,1,.36,1)',
          paddingTop:    'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* ── Header ────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-rule px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] tracking-[0.22em] text-recovered/60 uppercase mb-1">
              ARG ASSIST
            </p>
            <h2 className="font-serif text-[1.1rem] text-ink leading-tight">
              AI Placement Concierge
            </h2>
            <p className="font-mono text-[10px] text-slate/40 mt-1 leading-relaxed">
              Not legal advice — fees &amp; odds go to a specialist.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close ARG Assist"
            className="flex-shrink-0 mt-0.5 text-slate/40 hover:text-ink transition-colors"
            style={{ minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Messages ──────────────────────────────── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto divide-y divide-rule"
        >
          {turns.map(turn => (
            <div
              key={turn.id}
              className={`px-5 py-4 ${turn.role === 'user' ? 'bg-mist/40' : 'bg-paper'}`}
            >
              {/* Row label + timestamp */}
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`font-mono text-[9px] tracking-widest uppercase ${
                    turn.role === 'user' ? 'text-slate/60' : 'text-recovered/60'
                  }`}
                >
                  {turn.role === 'user' ? 'YOU' : 'ASSIST'}
                </span>
                <span className="font-mono text-[9px] text-slate/30 tabular-nums">
                  {fmtTime(turn.ts)}
                </span>
                {turn.streaming && (
                  <span className="flex gap-[3px]" aria-label="Composing response">
                    {[0, 120, 240].map(d => (
                      <span
                        key={d}
                        className="w-1 h-1 rounded-full bg-recovered/40"
                        style={{
                          animation: `pulse 900ms ${d}ms ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>

              {/* Content */}
              <p
                className={`leading-relaxed whitespace-pre-wrap ${
                  turn.role === 'user'
                    ? 'font-mono text-sm text-ink'
                    : 'font-serif text-[15px] text-ink'
                }`}
              >
                {turn.content}
                {turn.streaming && !turn.content && (
                  <span className="inline-block w-2 h-[1em] bg-slate/20 align-middle ml-0.5 animate-pulse" />
                )}
              </p>
            </div>
          ))}
        </div>

        {/* ── Handoff strip (visible once user has sent at least 1 message) ── */}
        {hasRealTurns && (
          <div className="flex-shrink-0 border-t border-rule px-5 py-2.5 bg-mist/30">
            <button
              onClick={handleHandoff}
              className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-slate/50 hover:text-recovered transition-colors group"
            >
              <ArrowRight
                size={11}
                className="group-hover:translate-x-0.5 transition-transform duration-150"
                aria-hidden="true"
              />
              Send to a specialist
            </button>
          </div>
        )}

        {/* ── Input ─────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-rule px-4 py-3 flex items-end gap-3">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about placement, process, or documents…"
            disabled={busy}
            className="flex-1 resize-none bg-transparent font-mono text-sm text-ink placeholder:text-slate/35 focus:outline-none leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            aria-label="Message ARG Assist"
          />
          <button
            onClick={() => void send()}
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate/40 hover:text-recovered disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
