import { useCallback, useMemo, useSyncExternalStore } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { chooseFlavours, storageKey } from './head-script.mjs';

export type Choice = Record<string, string>;

export interface FlavourSite {
  axes: Record<string, Record<string, string>>;
  defaults: Choice;
}

export const useFlavourSite = (): FlavourSite => useDocusaurusContext().siteConfig.customFields!.flavourSite as FlavourSite;

const listeners = new Set<() => void>();

const attribute = (axis: string): string => `data-${axis}`;

/** The saved choice as stored; null when nothing is saved, the storage is blocked or the JSON is damaged. */
export function readSaved(): Choice | null {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? 'null');
  } catch {
    return null;
  }
}

/** The flavours on `<html>`, which the head script sets from the address or the saved choice and a pick changes. */
export function readShown({ axes }: FlavourSite): Choice {
  const shown: Choice = {};
  for (const axis of Object.keys(axes)) {
    const flavour = document.documentElement.getAttribute(attribute(axis));
    if (flavour) shown[axis] = flavour;
  }
  return shown;
}

/**
 * Shows `choice` and saves it. The address stays as it is. Storage that throws keeps the choice for this page
 * view only.
 */
export function pickFlavours(choice: Choice): void {
  for (const [axis, flavour] of Object.entries(choice)) document.documentElement.setAttribute(attribute(axis), flavour);
  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...readSaved(), ...choice }));
  } catch {
    // The pick still shows; it is not remembered.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Applies the flavour that a bare anchor names, when it names one, after a navigation inside the site. The head
 * script does the same on a full page load.
 */
export function followAnchor(site: FlavourSite, hash: string): void {
  const { choice, save } = chooseFlavours({ search: '', hash, saved: readShown(site), ...site });
  if (save) pickFlavours(choice as Choice);
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * The reader's current pair. The server render and the first client render use the defaults, so they match;
 * the pair on `<html>` replaces them right after.
 */
export function useChoice(): Choice {
  const site = useFlavourSite();
  const snapshot = useCallback(() => JSON.stringify(readShown(site)), [site]);
  const shown = useSyncExternalStore(subscribe, snapshot, () => '{}');
  return useMemo(() => ({ ...site.defaults, ...JSON.parse(shown) }), [shown, site]);
}
