import { createElement, memo } from 'react';
import type { CSSProperties, ReactElement, SVGProps } from 'react';
import { pointsAttr } from '../diagrams/figure/geometry.ts';
import { ICONS } from '../diagrams/figure/icons.ts';
import type { IconName } from '../diagrams/figure/icons.ts';
import { ICON_RISE } from '../diagrams/figure/layout.ts';
import type { SceneSolid } from '../diagrams/figure/layout.ts';
import type { LegendItem } from '../diagrams/figure/types.ts';

const ICON_SIZE = 22;
const NAME_DROP = 15;
const MARK_TILE = 18;
const MARK_IMAGE = 14;
/** The lift at which a lit part takes its accent outline. */
const LIT_OUTLINE = 0.4;

function Icon({ name, x, y }: { name: IconName; x: number; y: number }): ReactElement {
  return (
    <g className="fig-icon" transform={`translate(${x - ICON_SIZE / 2} ${y - ICON_SIZE / 2}) scale(${ICON_SIZE / 24})`}>
      {ICONS[name].map(([tag, attributes], i) => createElement(tag, { key: i, ...attributes }))}
    </g>
  );
}

/**
 * One slab or part of a figure: wall facets, top face, outline, and for a part its icon or marks and its name. The words of
 * neighbouring SVG elements are kept apart by a space, so search reads them as words. `lit` is how far a flow figure has raised
 * the part, from 0 to 1: the lift grows with it and the accent outline shows once it is past `LIT_OUTLINE`. The other props go to
 * the group, which is how a figure adds hover handlers.
 */
export const Solid = memo(function Solid({ solid, active = false, lifted = false, lit = 0, ...group }: { solid: SceneSolid; active?: boolean; lifted?: boolean; lit?: number } & SVGProps<SVGGElement>): ReactElement {
  const { label } = solid;
  return (
    <g
      className={`fig-solid fig-${solid.kind} fig-tone-${solid.tone}${active || lit > LIT_OUTLINE ? ' fig-active' : ''}${lifted ? ' fig-lifted' : ''}${lit > 0 ? ' fig-lit' : ''}`}
      style={lit > 0 ? ({ '--lit': lit } as CSSProperties) : undefined}
      {...group}
    >
      {solid.facets.map((facet, i) => (
        <polygon key={i} className={`fig-facet fig-b${facet.bucket}`} points={pointsAttr(facet.points)} />
      ))}
      <polygon className="fig-top" points={pointsAttr(solid.top)} />
      <polygon className="fig-outline" points={pointsAttr(solid.hull)} />
      {solid.marks
        ? solid.marks.map((mark) => (
            <g key={mark.name} className="fig-mark">
              <rect x={mark.x - MARK_TILE / 2} y={mark.y - MARK_TILE / 2} width={MARK_TILE} height={MARK_TILE} rx="4" />
              <image href={mark.src} x={mark.x - MARK_IMAGE / 2} y={mark.y - MARK_IMAGE / 2} width={MARK_IMAGE} height={MARK_IMAGE}>
                <title>{mark.name}</title>
              </image>
            </g>
          ))
        : solid.kind === 'part' && solid.icon && <Icon name={solid.icon} x={label.x} y={label.y - ICON_RISE} />}{' '}
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
});

/** The small picture in front of a legend item, on a 34 by 22 grid. */
export function Swatch({ item }: { item: LegendItem }): ReactElement {
  if (item.swatch === 'remote' || item.swatch === 'link' || item.swatch === 'hop') {
    return (
      <svg className="structure-figure__swatch" viewBox="0 0 34 22" aria-hidden="true">
        <line className={item.swatch === 'remote' ? 'fig-link fig-link-remote' : item.swatch === 'link' ? 'fig-link' : 'fig-hop fig-hop-current'} x1="2" y1="11" x2="32" y2="11" />
      </svg>
    );
  }
  if (item.swatch === 'cube' || item.swatch === 'stack') {
    const stack = item.swatch === 'stack';
    const levels = stack ? [8, 4, 0] : [0];
    return (
      <svg className={`structure-figure__swatch fig-tone-${stack ? 'done' : 'cube'}`} viewBox="0 0 34 22" aria-hidden="true">
        {levels.map((rise) => (
          <g key={rise} transform={`translate(0 ${rise})`}>
            <polygon className="fig-facet fig-b3" points="9,5 17,9 17,13 9,9" />
            <polygon className="fig-facet fig-b0" points="25,5 17,9 17,13 25,9" />
            <polygon className="fig-top" points="17,1 25,5 17,9 9,5" />
          </g>
        ))}
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
