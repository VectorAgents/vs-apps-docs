import type { StructureData } from '../figure/types.ts';
import { slotOf } from './slots.ts';

/** Slot `record-of-work` of `the-record-of-work`: one actor on each execution, and four views over the records. */
export const recordOfWork: StructureData = {
  id: 'record-of-work',
  title: 'The record of work and its four views',
  desc: 'One Governance slab. Two actors stand on the left: a member and an app. Each joins the execution in the middle. Four governance views stand on the right: Overview, Health, Activity and Audit. A line joins the execution to each view.',
  caption: slotOf('record-of-work').caption,
  slabs: [
    { id: 'governance', label: 'Governance', text: 'Reads across the whole organization: who ran what, and what it cost.', level: 0, c: 0, r: 0, w: 19.6, d: 18 },
  ],
  parts: [
    { id: 'member', label: 'Member', text: 'A person. When a member starts work, the execution runs as that member.', icon: 'member', tone: 'plug', on: 'governance', c: 1.4, r: 5.2, w: 3.2, d: 2.8 },
    { id: 'app', label: 'App', text: 'A Vector App. When an app records an act, the actor is the app.', icon: 'app', tone: 'plug', on: 'governance', c: 1.4, r: 9.4, w: 3.2, d: 2.8 },
    { id: 'execution', label: 'Execution', text: 'One unit of work, such as an agent run. It has one actor. Vector Space also records what started it, such as a chat in the web app.', icon: 'execution', tone: 'core', on: 'governance', c: 8, r: 7.5, w: 3.2, d: 2.8 },
    { id: 'overview', label: 'Overview', text: 'What was spent, run or broken, by source. A figure opens the records behind it.', icon: 'overview', tone: 'core', on: 'governance', c: 14.6, r: 1.2, w: 3.2, d: 2.8 },
    { id: 'health', label: 'Health', text: 'What is wrong now, such as a connector whose calls fail.', icon: 'health', tone: 'core', on: 'governance', c: 14.6, r: 5.4, w: 3.2, d: 2.8 },
    { id: 'activity', label: 'Activity', text: 'What happened, in time order. A decided ask shows here.', icon: 'activity', tone: 'core', on: 'governance', c: 14.6, r: 9.6, w: 3.2, d: 2.8 },
    { id: 'audit', label: 'Audit', text: 'Who changed what: changes to access, to what the organization may use and to keys.', icon: 'audit', tone: 'core', on: 'governance', c: 14.6, r: 13.8, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'member-execution', from: 'member', to: 'execution' },
    { id: 'app-execution', from: 'app', to: 'execution' },
    { id: 'execution-overview', from: 'execution', to: 'overview' },
    { id: 'execution-health', from: 'execution', to: 'health' },
    { id: 'execution-activity', from: 'execution', to: 'activity' },
    { id: 'execution-audit', from: 'execution', to: 'audit' },
  ],
  legend: [
    { swatch: 'plug', text: 'An actor: who the work ran as' },
    { swatch: 'core', text: 'An execution, or a view that reads the records' },
    { swatch: 'link', text: 'Line: joins an actor, its execution and the views' },
  ],
};
