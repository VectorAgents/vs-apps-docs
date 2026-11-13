/**
 * Data for one ladder figure, the typed input of `LadderFigure`. One file per figure in
 * `src/diagrams/figures/<slot-id>.ts` exports a value of this type.
 *
 * A ladder is flat text, not a picture: steps from the lowest rung up, each listing only what it adds to the step below, and
 * asides that stand beside the steps and are not steps. Every word is real text in the page, with no hover or button path.
 * `scripts/ladder-figure.test.mjs` checks the rules.
 */
export interface LadderData {
  /** The slot id. */
  id: string;
  /** Names the figure for a screen reader. */
  title: string;
  /** Describes the shape of the figure for a screen reader. Not shown. */
  desc: string;
  /** Shown after "Fig. 1 · ". Taken from the slot table. */
  caption: string;
  /** Lowest rung first. */
  steps: LadderStep[];
  /** Dashed boxes beside the steps. */
  asides: LadderAside[];
}

export interface LadderStep {
  id: string;
  label: string;
  /** The pill: the share level the rung holds on every resource. */
  holds: string;
  /** Lead-in to `adds`. The lowest rung has none, because it adds to nothing. */
  plus?: string;
  /** Only the acts this rung adds, never one that a lower rung holds. */
  adds: string[];
}

export interface LadderAside {
  id: string;
  label: string;
  text: string;
}
