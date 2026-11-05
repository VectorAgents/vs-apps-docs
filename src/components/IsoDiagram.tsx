import { Fragment, useId } from 'react';
import type { ReactElement } from 'react';
import { BADGE_RADIUS, layoutDiagram } from '../diagrams/isoLayout.ts';
import type { IsoDiagramData, IsoLegendItem, IsoShape } from '../diagrams/isoLayout.ts';

function Shape({ shape }: { shape: IsoShape }): ReactElement {
  switch (shape.kind) {
    case 'block':
      return (
        <g className={shape.glow ? 'iso-glow' : undefined}>
          <polygon className={`iso-face iso-left tone-${shape.tone}`} points={shape.left} />
          <polygon className={`iso-face iso-right tone-${shape.tone}`} points={shape.right} />
          <polygon className={`iso-face iso-top tone-${shape.tone}`} points={shape.top} />
          {shape.highlight && <polyline className="iso-hi" points={shape.highlight} />}
        </g>
      );
    case 'slabLabel':
      return (
        <text className="iso-label iso-slab-label" x={shape.x} y={shape.y} textAnchor={shape.anchor}>
          {shape.text}
        </text>
      );
    case 'badge':
      return (
        <g className={shape.link ? 'iso-badge-link' : 'iso-badge-part'}>
          <circle className="iso-badge" cx={shape.x} cy={shape.y} r={BADGE_RADIUS} />
          <text className="iso-badge-text" x={shape.x} y={shape.y}>
            {shape.text}
          </text>
        </g>
      );
    case 'link':
      return (
        <g>
          <polyline className={shape.remote ? 'iso-link iso-remote' : 'iso-link'} points={shape.line} />
          <polygon className="iso-arrow" points={shape.head} />
        </g>
      );
  }
}

function Legend({ title, items, link, id }: { title: string; items: IsoLegendItem[]; link?: boolean; id: string }): ReactElement | null {
  if (items.length === 0) return null;
  return (
    <>
      <p className="iso-legend-title" id={id}>
        {title}
      </p>
      <ol className="iso-legend-list" role="list" aria-labelledby={id}>
        {items.map((item) => (
          <li key={item.text}>
            {item.marker && (
              <>
                <span className={link ? 'iso-key iso-key-link' : 'iso-key'}>{item.marker}</span>{' '}
              </>
            )}
            {item.text}
          </li>
        ))}
      </ol>
    </>
  );
}

/**
 * An isometric diagram drawn as inline SVG from typed data, with a visible legend under it that carries the same facts as text.
 * Colours come from the `--iso-*` tokens in `custom.css`, so the picture follows the theme with no second file.
 * The search plugin indexes SVG text, so a space sits between the text elements to keep their words apart.
 */
export default function IsoDiagram({ diagram, figure = 1 }: { diagram: IsoDiagramData; figure?: number }): ReactElement {
  const scene = layoutDiagram(diagram);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <div className="iso-diagram">
      <figure>
        <svg role="img" aria-labelledby={`${id}-title ${id}-desc`} viewBox={scene.viewBox} xmlns="http://www.w3.org/2000/svg">
          <title id={`${id}-title`}>{scene.title}</title>{' '}
          <desc id={`${id}-desc`}>{scene.desc}</desc>{' '}
          {scene.shapes.map((shape, i) => (
            <Fragment key={`${shape.kind}-${shape.id}-${i}`}>
              <Shape shape={shape} />{' '}
            </Fragment>
          ))}
        </svg>
        <figcaption>
          Fig. {figure} &middot; {scene.caption}
        </figcaption>
      </figure>
      <div className="iso-legend">
        <Legend title={scene.legend.titles.places} items={scene.legend.places} id={`${id}-places`} />
        <Legend title={scene.legend.titles.parts} items={scene.legend.parts} id={`${id}-parts`} />
        <Legend title={scene.legend.titles.links} items={scene.legend.path} link id={`${id}-links`} />
      </div>
    </div>
  );
}
