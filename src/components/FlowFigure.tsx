import useBaseUrl from '@docusaurus/useBaseUrl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { ASK_TILE, CUBE, ENVELOPE_SOLID, advance, captionAt, frameAt, layoutFlow, pausedAt, recordAt } from '../diagrams/figure/flow.ts';
import type { FlowLayout, Frame, FrameItem } from '../diagrams/figure/flow.ts';
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

/** A cube or an envelope, painted with its base centred on `x`, `y`. */
function Item({ x, y, tone, shape, opacity }: FrameItem): ReactElement {
  const solid = shape === 'envelope' ? ENVELOPE_SOLID : CUBE;
  return (
    <g className={`fig-item fig-tone-${tone === 'done' ? 'done' : 'cube'}`} transform={`translate(${x} ${y})`} opacity={opacity}>
      {solid.facets.map((facet, i) => (
        <polygon key={i} className={`fig-facet fig-b${facet.bucket}`} points={pointsAttr(facet.points)} />
      ))}
      <polygon className="fig-top" points={pointsAttr(solid.top)} />
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
        <Item key={i} {...item} />
      ))}
    </>
  );
}

/** Screen units from the base of the ask tile up to the pause mark and up to the tip of the tooltip. */
const PAUSE_RISE = 26;
const TIP_RISE = 52;

/**
 * The ask: a tile with a pause mark while it waits and a tick once it is approved. While the run waits, a click on the tile
 * approves, like the button in the tooltip. The tile is only a second target, so it is hidden from assistive technology.
 */
function AskTile({ ask, onApprove }: { ask: NonNullable<Frame['ask']>; onApprove: (() => void) | undefined }): ReactElement {
  const waiting = ask.state === 'waiting';
  return (
    <g className={`fig-ask fig-tone-plug${onApprove ? ' fig-ask-ready' : ''}`} transform={`translate(${ask.x} ${ask.y})`} aria-hidden="true" onClick={onApprove}>
      {ASK_TILE.facets.map((facet, i) => (
        <polygon key={i} className={`fig-facet fig-b${facet.bucket}`} points={pointsAttr(facet.points)} />
      ))}
      <polygon className="fig-top" points={pointsAttr(ASK_TILE.top)} />
      <text className="fig-label fig-ask-word" x="0" y="-1" textAnchor="middle">
        {waiting ? 'Ask' : '\u2713'}
      </text>
      {waiting && (
        <g className="fig-pause">
          <rect x="-7" y={-PAUSE_RISE - 9} width="5" height="18" rx="1" />
          <rect x="2" y={-PAUSE_RISE - 9} width="5" height="18" rx="1" />
        </g>
      )}
    </g>
  );
}

/**
 * The chat card at the point of its effect, as plain HTML on top of the figure. Its right edge never goes left of the card's own width, so
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

/** The email that an agent drafts, as plain HTML at the point of its effect. The caption does not repeat it, and it is example text, so it is hidden from assistive technology. */
function Draft({ draft, box }: { draft: NonNullable<Frame['draft']>; box: readonly [x: number, y: number, w: number, h: number] }): ReactElement {
  const style = { left: `min(${((draft.x - box[0]) / box[2]) * 100}%, calc(100% - var(--flow-draft-width)))`, top: `${((draft.y - box[1]) / box[3]) * 100}%` };
  return (
    <div className="flow-figure__draft" style={style} aria-hidden="true">
      <p className="flow-figure__draft-head">
        <span>{draft.from}</span>
        <span>{draft.state === 'ready' ? 'Draft ready' : 'Drafting'}</span>
      </p>
      <p className="flow-figure__draft-line">
        To: <b>{draft.to}</b>
      </p>
      <p className="flow-figure__draft-line">
        Subject: <b>{draft.subject}</b>
      </p>
      <p className="flow-figure__draft-body">
        {draft.body}
        {draft.state === 'drafting' && <span className="flow-figure__caret" />}
      </p>
    </div>
  );
}

/**
 * An isometric figure that plays. It auto-plays once when half of it shows, never loops, and has one icon button that plays,
 * pauses and replays. A step pill plays from the start of its scene. Under reduced motion nothing plays: the figure opens at
 * rest, Previous and Next step between the still poses of the scenes, and a pill jumps to one. The caption, the pills, the
 * record of work as a real table and a collapsed text version of the steps are the text alternative of the picture. A scene that
 * pauses stops the play at an ask: an Approve button on the tooltip takes focus and the run goes on only when the reader uses
 * it. A step has a link to the heading of the page that explains it.
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
  const approveButton = useRef<HTMLButtonElement>(null);
  const focusAsk = useRef(false);

  const seek = useCallback((to: number, play: boolean) => {
    progress.current = to;
    setP(to);
    setPlaying(play);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const before = progress.current;
      const next = advance(data, before, Math.min(now - last, MAX_TICK));
      last = now;
      progress.current = next;
      setP(next);
      // A first tick can run with no time passed. Starting on a pause (the approval) must not stop on it again.
      if (next >= end || (next > before && pausedAt(data, next))) {
        focusAsk.current = !reduced && pausedAt(data, next);
        setPlaying(false);
      } else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, data, end, reduced]);

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
  const caption = captionAt(data, p);
  const finished = p >= end;
  const waiting = !playing && pausedAt(data, p);
  const label = playing ? 'Pause' : finished ? 'Replay' : 'Play';
  useEffect(() => {
    if (!waiting || !focusAsk.current) return;
    focusAsk.current = false;
    approveButton.current?.focus({ preventScroll: true });
  }, [waiting]);
  const sceneOfStep = (step: number): number => data.scenes.findIndex((s) => s.step === step) + 1;
  const toggle = (): void => {
    if (playing) setPlaying(false);
    else seek(finished ? 0 : progress.current, true);
  };
  const approve = (): void => seek(reduced ? Math.floor(progress.current + 1e-9) + 1 : progress.current, !reduced);
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
            {frame.ask && <AskTile ask={frame.ask} onApprove={waiting ? approve : undefined} />}
          </svg>
          {frame.chat && <Chat chat={frame.chat} box={[x0, y0, w, h]} />}
          {frame.draft && <Draft draft={frame.draft} box={[x0, y0, w, h]} />}
          {frame.ask?.state === 'waiting' && (
            <div className="flow-figure__tip" role="status" style={{ left: `${((frame.ask.x - x0) / w) * 100}%`, top: `${((frame.ask.y - TIP_RISE - y0) / h) * 100}%` }}>
              Waiting for you. Approve to continue.
              <button type="button" className="flow-figure__approve" ref={approveButton} disabled={!waiting} onClick={approve}>
                Approve
              </button>
            </div>
          )}
        </div>
        <div className="flow-figure__controls">
          <button type="button" className="flow-figure__play" aria-label={label} title={waiting ? 'Approve to continue' : label} disabled={waiting} onClick={toggle}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {ICON_PATHS[label]}
            </svg>
          </button>
          <button type="button" className="flow-figure__move" disabled={p <= 0} onClick={() => seek(Math.max(Math.ceil(progress.current - 1e-9) - 1, 0), false)}>
            Previous
          </button>
          <button type="button" className="flow-figure__move" disabled={finished} onClick={() => (waiting ? approve() : seek(Math.min(Math.floor(progress.current + 1e-9) + 1, end), false))}>
            {waiting ? 'Approve' : 'Next'}
          </button>
        </div>
        <section className="flow-figure__panel flow-figure__panel--steps" aria-label="Current step">
          <p className="flow-figure__step">
            {current === null ? 'Start' : `Step ${current} of ${data.steps.length}`}
            {current !== null && data.steps[current - 1].href && (
              <>
                {' '}
                <a href={data.steps[current - 1].href}>Read this step</a>
              </>
            )}
          </p>
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
