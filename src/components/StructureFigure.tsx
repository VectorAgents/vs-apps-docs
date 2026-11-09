import { Fragment, createElement, useEffect, useId, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { pointsAttr } from '../diagrams/figure/geometry.ts';
import { ICONS } from '../diagrams/figure/icons.ts';
import type { IconName } from '../diagrams/figure/icons.ts';
import { LIFT, layoutStructure } from '../diagrams/figure/layout.ts';
import type { SceneEntry, SceneSolid, StructureScene } from '../diagrams/figure/layout.ts';
import type { LegendItem, StructureData } from '../diagrams/figure/types.ts';

const ICON_SIZE = 22;
/** Distance from the middle of a part's top face to the middle of its icon, and to the baseline of its name. */
const ICON_RISE = 6;
const NAME_DROP = 15;

const HINT = 'Hover or focus a part or a slab to read about it. Click to keep it open. Press Escape to close it.';

function Icon({ name, x, y }: { name: IconName; x: number; y: number }): ReactElement {
  return (
    <g className="fig-icon" transform={`translate(${x - ICON_SIZE / 2} ${y - ICON_SIZE / 2}) scale(${ICON_SIZE / 24})`}>
      {ICONS[name].map(([tag, attributes], i) => createElement(tag, { key: i, ...attributes }))}
    </g>
  );
}

function Solid({ solid, active, pinned, onEnter, onLeave, onToggle }: { solid: SceneSolid; active: boolean; pinned: boolean; onEnter: () => void; onLeave: () => void; onToggle: () => void }): ReactElement {
  const { label } = solid;
  return (
    <g
      className={`fig-solid fig-${solid.kind} fig-tone-${solid.tone}${active ? ' fig-active' : ''}${pinned ? ' fig-lifted' : ''}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onToggle}
    >
      {solid.facets.map((facet, i) => (
        <polygon key={i} className={`fig-facet fig-b${facet.bucket}`} points={pointsAttr(facet.points)} />
      ))}
      <polygon className="fig-top" points={pointsAttr(solid.top)} />
      <polygon className="fig-outline" points={pointsAttr(solid.hull)} />
      {solid.kind === 'part' && solid.icon && <Icon name={solid.icon} x={label.x} y={label.y - ICON_RISE} />}{' '}
      {solid.kind === 'part' ? (
        <text className="fig-label" x={label.x} y={label.y + NAME_DROP} textAnchor="middle">
          {label.text}
        </text>
      ) : (
        <text className="fig-label fig-label-slab" transform={`translate(${label.x} ${label.y}) skewY(30)`}>
          {label.text}
        </text>
      )}
    </g>
  );
}

function Swatch({ item }: { item: LegendItem }): ReactElement {
  if (item.swatch === 'remote' || item.swatch === 'link') {
    return (
      <svg className="structure-figure__swatch" viewBox="0 0 34 22" aria-hidden="true">
        <line className={item.swatch === 'remote' ? 'fig-link fig-link-remote' : 'fig-link'} x1="2" y1="11" x2="32" y2="11" />
      </svg>
    );
  }
  return (
    <svg className={`structure-figure__swatch fig-tone-${item.swatch}`} viewBox="0 0 34 22" aria-hidden="true">
      <polygon className="fig-facet fig-b3" points="2,8 17,15 17,21 2,14" />
      <polygon className="fig-facet fig-b0" points="32,8 17,15 17,21 32,14" />
      <polygon className="fig-top" points="2,8 17,1 32,8 17,15" />
    </svg>
  );
}

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
                pinned={pinned === solid.id && solid.lift > 0}
                onEnter={() => setPreview(solid.id)}
                onLeave={() => setPreview(null)}
                onToggle={() => toggle(solid.id)}
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
