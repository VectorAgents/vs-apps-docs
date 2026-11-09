import type { ReactElement } from 'react';
import { slots } from '../diagrams/figures/slots.ts';

/** Stands in for the figure of one slot until the real figure replaces this tag. */
export default function FigurePlaceholder({ slot }: { slot: string }): ReactElement {
  const row = slots.find((s) => s.id === slot);
  if (!row) throw new Error(`Unknown figure slot "${slot}"`);
  return (
    <figure className="figure-placeholder" role="img" aria-label={row.caption}>
      <div className={`figure-placeholder__frame figure-placeholder__frame--${row.kind}`}>Diagram in progress</div>
      <figcaption>{`Fig. 1 · ${row.caption}`}</figcaption>
    </figure>
  );
}
