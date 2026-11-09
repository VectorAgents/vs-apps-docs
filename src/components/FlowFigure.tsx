import useBaseUrl from '@docusaurus/useBaseUrl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { CUBE, advance, frameAt, layoutFlow, recordAt } from '../diagrams/figure/flow.ts';
import type { FlowLayout, Frame } from '../diagrams/figure/flow.ts';
import type { FlowData } from '../diagrams/figure/flow-types.ts';
import { LIFT } from '../diagrams/figure/layout.ts';
import { pointsAttr } from '../diagrams/figure/geometry.ts';
import { Solid, Swatch } from './FigureShapes.tsx';

/** Milliseconds between the figure showing and the auto-play starting, so the reader sees the rest pose first. */
const AUTOPLAY_DELAY = 600;
/** Longest step of the clock, in milliseconds. A tab that was hidden resumes where it stopped instead of jumping ahead. */
const MAX_TICK = 100;
/** Share of the figure that must show before it plays. */
const AUTOPLAY_VISIBLE = 0.5;

const ICON_PATHS = {
  Play: <polygon points="6 3 20 12 6 21 6 3" />,
  Pause: (
    <>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </>
  ),
  Replay: (
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
};

/** True while the reader asks for reduced motion. It is false on the server and until the page has mounted. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Cube({ x, y, tone, opacity }: { x: number; y: number; tone: 'work' | 'done'; opacity: number }): ReactElement {
  return (
    <g className={`fig-item fig-tone-${tone === 'done' ? 'done' : 'cube'}`} transform={`translate(${x} ${y})`} opacity={opacity}>
      {CUBE.facets.map((facet, i) => (
        <polygon key={i} className={`fig-facet fig-b${facet.bucket}`} points={pointsAttr(facet.points)} />
      ))}
      <polygon className="fig-top" points={pointsAttr(CUBE.top)} />
    </g>
  );
}

/** What moves over the structure at one instant: hop lines, rings, dots and cubes, in paint order. */
function Motion({ frame }: { frame: Frame }): ReactElement {
  return (
    <>
      {frame.hops.map((hop, i) => (
        <polyline key={i} className={`fig-hop ${hop.current ? 'fig-hop-current' : 'fig-hop-done'}`} points={pointsAttr(hop.points)} />
      ))}
      {frame.rings.map((ring, i) => (
        <ellipse key={i} className="fig-ring" cx={ring.x} cy={ring.y} rx={ring.radius * 1.2} ry={ring.radius * 0.6} opacity={ring.opacity} />
      ))}
      {frame.dots.map((dot, i) => (
        <circle key={i} className="fig-dot" cx={dot.x} cy={dot.y} r={dot.radius} />
      ))}
      {frame.items.map((item, i) => (
        <Cube key={i} {...item} />
      ))}
    </>
  );
}

/**
 * The chat card beside the Member, as plain HTML on top of the figure. Its right edge never goes left of the card's own width, so
 * the card stays inside the stage. The caption repeats its words, so it is hidden from assistive technology.
 */
function Chat({ chat, box }: { chat: NonNullable<Frame['chat']>; box: readonly [x: number, y: number, w: number, h: number] }): ReactElement {
  const style = { left: `max(${((chat.x - box[0]) / box[2]) * 100}%, var(--flow-chat-width))`, top: `${((chat.y - box[1]) / box[3]) * 100}%` };
  return (
    <div className={`flow-figure__chat flow-figure__chat--${chat.state}`} style={style} aria-hidden="true">
      <span className="flow-figure__chat-text">
        {chat.text}
        {chat.state === 'typing' && <span className="flow-figure__caret" />}
      </span>
      <span className="flow-figure__chat-send">&uarr;</span>
    </div>
  );
}

/**
 * An isometric figure that plays. It auto-plays once when half of it shows, never loops, and has one icon button that plays,
 * pauses and replays. A step pill plays from the start of its scene. Under reduced motion nothing plays: the figure opens at
 * rest, Previous and Next step between the still poses of the scenes, and a pill jumps to one. The caption, the pills, the
 * record of work as a real table and a collapsed text version of the steps are the text alternative of the picture.
 */
export default function FlowFigure({ data, figure = 1 }: { data: FlowData; figure?: number }): ReactElement {
  const layout: FlowLayout = useMemo(() => layoutFlow(data), [data]);
  const base = useBaseUrl('/');
  const scene = useMemo(
    () => ({
      ...layout.structure,
      solids: layout.structure.solids.map((solid) => (solid.marks ? { ...solid, marks: solid.marks.map((mark) => ({ ...mark, src: base + mark.src.replace(/^\//, '') })) } : solid)),
    }),
    [layout, base],
  );
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const reduced = useReducedMotion();
  const end = data.scenes.length;
  const [p, setP] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progress = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const seek = useCallback((to: number, play: boolean) => {
    progress.current = to;
    setP(to);
    setPlaying(play);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const next = advance(data, progress.current, Math.min(now - last, MAX_TICK));
      last = now;
      progress.current = next;
      setP(next);
      if (next >= end) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, data, end]);

  useEffect(() => {
    if (reduced) seek(Math.ceil(progress.current), false);
  }, [reduced, seek]);

  useEffect(() => {
    const node = stage.current;
    if (!node || reduced || started.current) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        watch.disconnect();
        timer = setTimeout(() => {
          if (progress.current === 0) seek(0, true);
        }, AUTOPLAY_DELAY);
      },
      { threshold: AUTOPLAY_VISIBLE },
    );
    watch.observe(node);
    return () => {
      watch.disconnect();
      clearTimeout(timer);
    };
  }, [reduced, seek]);

  const frame = useMemo(() => frameAt(layout, p), [layout, p]);
  const current = frame.scene === 0 ? null : data.scenes[frame.scene - 1].step;
  const caption = current === null ? data.intro : data.steps[current - 1].text;
  const finished = p >= end;
  const label = playing ? 'Pause' : finished ? 'Replay' : 'Play';
  const sceneOfStep = (step: number): number => data.scenes.findIndex((s) => s.step === step) + 1;
  const toggle = (): void => {
    if (playing) setPlaying(false);
    else seek(finished ? 0 : progress.current, true);
  };
  const jump = (step: number): void => seek(reduced ? sceneOfStep(step) : sceneOfStep(step) - 1, !reduced);
  const [x0, y0, w, h] = scene.viewBox.split(' ').map(Number);

  return (
    <figure className="flow-figure">
      <div className="flow-figure__stage" ref={stage} style={{ '--flow-aspect': h / w, '--fig-lift': `${LIFT}px` } as CSSProperties}>
        <div className="flow-figure__canvas">
          <svg className="fig-svg" role="img" aria-labelledby={`${id}-title ${id}-desc`} viewBox={scene.viewBox} xmlns="http://www.w3.org/2000/svg">
            <title id={`${id}-title`}>{scene.title}</title>{' '}
            <desc id={`${id}-desc`}>{scene.desc}</desc>{' '}
            {scene.solids.map((solid) => (
              <Solid key={solid.id} solid={solid} lit={frame.lit[solid.id] ?? 0} />
            ))}
            {scene.links.map((link) => (
              <line key={link.id} className={link.remote ? 'fig-link fig-link-remote' : 'fig-link'} x1={link.points[0][0]} y1={link.points[0][1]} x2={link.points[1][0]} y2={link.points[1][1]} />
            ))}
            <Motion frame={frame} />
          </svg>
          {frame.chat && <Chat chat={frame.chat} box={[x0, y0, w, h]} />}
        </div>
        <div className="flow-figure__controls">
          <button type="button" className="flow-figure__play" aria-label={label} title={label} onClick={toggle}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {ICON_PATHS[label]}
            </svg>
          </button>
          <button type="button" className="flow-figure__move" disabled={p <= 0} onClick={() => seek(Math.max(Math.ceil(progress.current - 1e-9) - 1, 0), false)}>
            Previous
          </button>
          <button type="button" className="flow-figure__move" disabled={finished} onClick={() => seek(Math.min(Math.floor(progress.current + 1e-9) + 1, end), false)}>
            Next
          </button>
        </div>
        <section className="flow-figure__panel flow-figure__panel--steps" aria-label="Current step">
          <p className="flow-figure__step">{current === null ? 'Start' : `Step ${current} of ${data.steps.length}`}</p>
          <p className="flow-figure__caption" aria-live="polite">
            {caption}
          </p>
          <div className="flow-figure__pills" role="group" aria-label="Steps">
            {data.steps.map((_, i) => (
              <button key={i} type="button" disabled={sceneOfStep(i + 1) === 0} aria-label={`Step ${i + 1}`} aria-current={current === i + 1 ? 'step' : undefined} onClick={() => jump(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        </section>
        <section className="flow-figure__panel flow-figure__panel--record" aria-label="Record of work">
          <table>
            <caption>Record of work</caption>
            <thead>
              <tr>
                <th scope="col">What was recorded</th>
                <th scope="col">Actor</th>
              </tr>
            </thead>
            <tbody>
              {recordAt(data, p).map((row, i, rows) => (
                <tr key={row.text} className={i === rows.length - 1 ? 'flow-figure__latest' : undefined}>
                  <td>{row.text}</td>
                  <td>{row.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <ul className="flow-figure__panel flow-figure__panel--legend structure-figure__legend" role="list" aria-label="Legend">
          {scene.legend.map((item) => (
            <li key={item.text}>
              <Swatch item={item} /> {item.text}
            </li>
          ))}
        </ul>
      </div>
      <figcaption>
        Fig. {figure} &middot; {scene.caption}
      </figcaption>
      <details className="flow-figure__text">
        <summary>Text version</summary>
        <ol>
          {data.steps.map((step) => (
            <li key={step.text}>{step.text}</li>
          ))}
        </ol>
      </details>
    </figure>
  );
}
