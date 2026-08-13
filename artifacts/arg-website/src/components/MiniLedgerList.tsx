/**
 * MiniLedgerList — numbered what-happens-next / step list.
 *
 * Renders a bordered ledger card with sequential rule-draw animation:
 * each step's top rule scaleX-draws, then the number fades, then the text
 * fades, offset by 100ms per step.
 *
 * Animation is managed internally — no animation refs needed in the page.
 * Uses createReveal() so each step self-registers with the ScrollDirector.
 *
 * Usage:
 *   const STEPS = [
 *     { n: '01', text: 'We review your portfolio or file details' },
 *     { n: '02', text: 'A specialist calls to scope strategy and terms' },
 *     { n: '03', text: 'Placement goes live — recovery work begins' },
 *   ];
 *
 *   <MiniLedgerList
 *     steps={STEPS}
 *     label="What Happens Next"
 *     revealIdPrefix="my-page-steps"
 *   />
 */
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { createReveal } from '@/motion/director';
import { useMotion } from '@/motion/MotionProvider';

export interface MiniStep {
  /** Zero-padded step number, e.g. "01" */
  n: string;
  text: string;
}

export interface MiniLedgerListProps {
  steps: MiniStep[];
  /** Mono eyebrow label displayed above the list */
  label?: string;
  /**
   * Prefix for ScrollTrigger reveal IDs (required when used on more than one
   * page to avoid duplicate-ID warnings). E.g. "contact-steps".
   */
  revealIdPrefix?: string;
}

export function MiniLedgerList({ steps, label, revealIdPrefix = 'mini-ledger' }: MiniLedgerListProps) {
  const { reducedMotion, ready } = useMotion();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!ready || reducedMotion) return;

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((el, i) => {
        if (!el) return;

        const ruleEl = el.querySelector<HTMLElement>('[data-rule]');
        const numEl  = el.querySelector<HTMLElement>('[data-num]');
        const textEl = el.querySelector<HTMLElement>('[data-text]');

        // Initial hidden state
        gsap.set(el, { opacity: 0 });
        if (ruleEl) gsap.set(ruleEl, { scaleX: 0, transformOrigin: 'left center' });
        if (numEl)  gsap.set(numEl,  { opacity: 0 });
        if (textEl) gsap.set(textEl, { opacity: 0 });

        createReveal(el, {
          id: `${revealIdPrefix}-${i}`,
          start: 'top 88%',
          onEnter: () => {
            gsap.set(el, { opacity: 1 });
            const tl = gsap.timeline({ delay: i * 0.1 });
            if (ruleEl) tl.to(ruleEl, { scaleX: 1, duration: 0.22, ease: 'power2.out' }, 0);
            if (numEl)  tl.to(numEl,  { opacity: 1, duration: 0.20 }, ruleEl ? 0.18 : 0);
            if (textEl) tl.to(textEl, { opacity: 1, duration: 0.28 }, ruleEl ? 0.28 : 0.1);
          },
        });
      });
    });

    return () => ctx.revert();
  }, [ready, reducedMotion, revealIdPrefix]);

  return (
    <div>
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-3">
          {label}
        </p>
      )}
      <div className="border border-rule rounded-sm overflow-hidden">
        {steps.map((s, i) => (
          <div
            key={s.n}
            ref={el => { itemRefs.current[i] = el; }}
            className="relative flex items-start gap-4 px-4 py-3"
          >
            {/* Rule between steps — animated scaleX by GSAP (not for first step) */}
            {i > 0 && (
              <div
                data-rule
                className="absolute top-0 left-0 right-0 h-[1px] bg-rule origin-left"
                aria-hidden="true"
              />
            )}
            <span
              data-num
              className="font-mono text-[10px] text-slate/40 tabular-nums pt-0.5 flex-shrink-0"
            >
              {s.n}
            </span>
            <span data-text className="font-mono text-xs text-ink leading-relaxed">
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
