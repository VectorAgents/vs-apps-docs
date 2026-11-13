import { useId } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import type { LadderData } from '../diagrams/figure/ladder-types.ts';

/** A role ladder as a `<figure>` of real text: an ordered list of steps from the lowest rung, and the asides beside it. */
export default function LadderFigure({ data, figure = 1 }: { data: LadderData; figure?: number }): ReactElement {
  const descId = useId();
  return (
    <figure className="ladder-figure" role="group" aria-label={data.title} aria-describedby={descId}>
      <p id={descId} className="ladder-figure__desc">
        {data.desc}
      </p>
      <ol className="ladder-figure__steps">
        {data.steps.map((step, i) => (
          <li key={step.id} className="ladder-figure__step" style={{ '--i': i } as CSSProperties}>
            <div className="ladder-figure__head">
              <span className="ladder-figure__name">{step.label}</span>
              <span className="ladder-figure__tag">{step.holds}</span>
            </div>
            {step.plus && <p className="ladder-figure__plus">{step.plus}</p>}
            <ul className="ladder-figure__adds">
              {step.adds.map((act) => (
                <li key={act}>{act}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <ul className="ladder-figure__asides">
        {data.asides.map((aside) => (
          <li key={aside.id} className="ladder-figure__aside">
            <strong>{aside.label}</strong> {aside.text}
          </li>
        ))}
      </ul>
      <figcaption>
        Fig. {figure} &middot; {data.caption}
      </figcaption>
    </figure>
  );
}
