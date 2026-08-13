/**
 * LedgerRow — tappable contact-row pattern.
 *
 * - Desktop: clicking copies the value to clipboard (shows "Copied ✓").
 * - Mobile / fax: falls through to the href (tel:, mailto:).
 * - The green accent bar animates in on hover.
 * - noBorder: caller controls the top rule (for rule-draw animation via GSAP).
 *
 * Usage:
 *   <LedgerRow label="Phone" value="(877) 464-8470" href="tel:8774648470" type="phone" />
 *   <LedgerRow label="Email" value="collect@..." href="mailto:..." type="email" />
 *   <LedgerRow label="Fax"   value="(888) 881-8211" type="fax" />
 */
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface LedgerRowProps {
  label: string;
  value: string;
  href?: string;
  /** Controls copy/link behaviour and value sizing */
  type: 'phone' | 'email' | 'fax' | 'link';
  /** When true, omits the bottom border (use when the caller draws the rule) */
  noBorder?: boolean;
}

export function LedgerRow({ label, value, href, type, noBorder = false }: LedgerRowProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!href || type === 'fax') return;
    const isPointerFine =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches;
    if (isPointerFine) {
      e.preventDefault();
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const inner = (
    <span
      className={`group relative flex items-center justify-between min-h-[44px] px-0 py-3 ${
        noBorder ? '' : 'border-b border-rule'
      } transition-colors hover:bg-mist cursor-pointer`}
    >
      {/* Recovered-green accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm bg-recovered opacity-0 group-hover:opacity-100"
        style={{ transition: 'opacity 150ms ease' }}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate select-none transition-transform duration-200 group-hover:translate-x-[6px]">
        {label}
      </span>
      <span className="flex items-center gap-2">
        {copied ? (
          <span className="font-mono text-sm text-recovered">Copied ✓</span>
        ) : (
          <span
            className={`font-mono tabular-nums text-ink ${
              type === 'email' ? 'text-sm md:text-base break-all' : 'text-base md:text-lg'
            }`}
          >
            {value}
          </span>
        )}
        {href && !copied && (
          <ChevronRight
            size={13}
            className="text-slate/30 group-hover:text-recovered flex-shrink-0"
            style={{ transition: 'color 150ms ease' }}
            aria-hidden="true"
          />
        )}
      </span>
    </span>
  );

  if (!href) return <div>{inner}</div>;
  return (
    <a href={href} onClick={handleClick}>
      {inner}
    </a>
  );
}
