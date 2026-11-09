import { Fragment, useEffect, useId, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { LIFT, layoutStructure } from '../diagrams/figure/layout.ts';
import type { SceneEntry, StructureScene } from '../diagrams/figure/layout.ts';
import type { StructureData } from '../diagrams/figure/types.ts';
import { Solid, Swatch } from './FigureShapes.tsx';

const HINT = 'Hover or focus a part or a slab to read about it. Click to keep it open. Press Escape to close it.';

function Card({ entry }: { entry: SceneEntry | undefined }): ReactElement {
  if (!entry) return <p className="structure-figure__hint">{HINT}</p>;
  return (
    <>
      <strong>{entry.label}</strong> {entry.text}
      {entry.items && (
        <ul className="structure-figure__items" role="list">
          {entry.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * A static isometric figure of slabs and parts. Hover or focus fills the detail card, a click pins a part (it lifts and gets
 * an accent outline) and Escape clears the pin. The buttons under the figure, one per part and slab, are the keyboard path
 * and repeat the figure as text. The words of neighbouring SVG elements are kept apart by a space, so search reads them as words.
 */
export default function StructureFigure({ data, figure = 1 }: { data: StructureData; figure?: number }): ReactElement {
  const scene: StructureScene = layoutStructure(data);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [preview, setPreview] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const toggle = (target: string): void => setPinned((current) => (current === target ? null : target));

  useEffect(() => {
    if (pinned === null) return undefined;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setPinned(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  const shown = preview ?? pinned;
  return (
    <figure className="structure-figure">
      <div className="structure-figure__stage" role="group" aria-label={scene.title} tabIndex={0}>
        <svg
          className="fig-svg"
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
          viewBox={scene.viewBox}
          style={{ '--fig-lift': `${LIFT}px` } as CSSProperties}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id={`${id}-title`}>{scene.title}</title>{' '}
          <desc id={`${id}-desc`}>{scene.desc}</desc>{' '}
          {scene.solids.map((solid) => (
            <Fragment key={solid.id}>
              <Solid
                solid={solid}
                active={shown === solid.id || pinned === solid.id}
                lifted={pinned === solid.id && solid.lift > 0}
                onPointerEnter={() => setPreview(solid.id)}
                onPointerLeave={() => setPreview(null)}
                onClick={() => toggle(solid.id)}
              />{' '}
            </Fragment>
          ))}
          {scene.links.map((link) => (
            <line key={link.id} className={link.remote ? 'fig-link fig-link-remote' : 'fig-link'} x1={link.points[0][0]} y1={link.points[0][1]} x2={link.points[1][0]} y2={link.points[1][1]} />
          ))}
        </svg>
      </div>
      <figcaption>
        Fig. {figure} &middot; {scene.caption}
      </figcaption>
      <ul className="structure-figure__legend" role="list">
        {scene.legend.map((item) => (
          <li key={item.text}>
            <Swatch item={item} /> {item.text}
          </li>
        ))}
      </ul>
      <div className="structure-figure__card" aria-live="polite">
        <Card entry={scene.entries.find((e) => e.id === shown)} />
      </div>
      <ul className="structure-figure__buttons" role="list">
        {scene.entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              aria-pressed={pinned === entry.id}
              onFocus={() => setPreview(entry.id)}
              onBlur={() => setPreview(null)}
              onClick={() => toggle(entry.id)}
            >
              {entry.label}
            </button>
          </li>
        ))}
      </ul>
    </figure>
  );
}
