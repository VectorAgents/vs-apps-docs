import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentProps, MouseEvent, ReactElement } from 'react';
import OriginalA from '@theme-original/MDXComponents/A';
import Link from '@docusaurus/Link';
import index from '../../../docs-gen/glossary-index.json';

type Entry = { term: string; definition: string; owner?: string };
type Props = ComponentProps<typeof OriginalA>;

const OPEN_DELAY_MS = 120;
const CARD_WIDTH_PX = 320;
const CLOSE_DELAY_MS = 200;
const EDGE_PX = 8;
// Space above a link that the sticky navbar takes; a card that would reach under it opens below the link.
const NAVBAR_PX = 72;

const entries: Record<string, Entry> = index;

const entryOf = (href: unknown): Entry | undefined => {
  const match = typeof href === 'string' ? /(vector-space|vector-apps|sdk)\/glossary\/?#([^/?#]+)$/.exec(href) : null;
  return match ? entries[`${match[1]}#${match[2]}`] : undefined;
};

type Placement = { shift: number; width: number; below: boolean };

function GlossaryLink({ entry, ...props }: Props & { entry: Entry }): ReactElement {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>({ shift: 0, width: CARD_WIDTH_PX, below: false });
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Set while Escape returns focus to the link, so the focus event does not reopen the card.
  const returning = useRef(false);

  // The shift is worked out before the card renders: a card that overflows the viewport would widen it on a phone,
  // and measuring the card afterwards would then see the wider viewport.
  const place = () => {
    const viewport = document.documentElement.clientWidth;
    const width = Math.min(CARD_WIDTH_PX, viewport - 2 * EDGE_PX);
    const left = wrapper.current?.getClientRects()[0]?.left ?? 0;
    const shift = Math.min(Math.max(left, EDGE_PX), viewport - EDGE_PX - width) - left;
    setPlacement((previous) => ({ ...previous, shift, width }));
  };
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      place();
      setOpen(true);
    }, OPEN_DELAY_MS);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    if (!open || !card.current || !wrapper.current) return;
    const above = wrapper.current.getClientRects()[0].top - card.current.offsetHeight;
    setPlacement((previous) => ({ ...previous, below: above < NAVBAR_PX }));
  }, [open]);

  // A tap outside the card is the touch way to close it.
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // First tap on touch opens the card; the card's own link navigates.
    if ((event.nativeEvent as PointerEvent).pointerType === 'touch' && !open) {
      event.preventDefault();
      clearTimeout(timer.current);
      place();
      setOpen(true);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Escape' || !open) return;
    clearTimeout(timer.current);
    setOpen(false);
    if (card.current?.contains(document.activeElement)) {
      returning.current = true;
      wrapper.current?.querySelector('a')?.focus();
      returning.current = false;
    }
  };

  return (
    <span
      ref={wrapper}
      className="glossary-term"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={() => !returning.current && show()}
      onBlur={(event) => !wrapper.current?.contains(event.relatedTarget as Node | null) && hide()}
      onKeyDown={onKeyDown}
    >
      <OriginalA {...props} onClick={onClick} aria-expanded={open} aria-controls={open ? id : undefined} />
      {open && (
        <span
          ref={card}
          role="dialog"
          aria-label={entry.term}
          id={id}
          className={`glossary-card${placement.below ? ' glossary-card--below' : ''}`}
          style={{ width: placement.width, transform: `translateX(${placement.shift}px)` }}
        >
          <strong className="glossary-card__term">{entry.term}</strong>
          <span className="glossary-card__definition">{entry.definition}</span>
          {entry.owner && <span className="glossary-card__owner">Owner: {entry.owner}</span>}
          <Link className="glossary-card__open" to={props.href}>
            Open in glossary
          </Link>
        </span>
      )}
    </span>
  );
}

export default function A(props: Props): ReactElement {
  const entry = entryOf(props.href);
  return entry ? <GlossaryLink entry={entry} {...props} /> : <OriginalA {...props} />;
}
