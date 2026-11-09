import siteConfig from '@generated/docusaurus.config';
import type { FlavourSite } from './useFlavours';
import { followAnchor, pickFlavours, readShown } from './useFlavours';
import { shareUrl } from './resolve.mjs';

const site = siteConfig.customFields!.flavourSite as FlavourSite;

const anchorOf = (hash: string): HTMLElement | null => {
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

/** Runs after each navigation inside the site: a bare anchor that names a flavour switches to it and scrolls there. */
export function onRouteDidUpdate({ location }: { location: { hash: string } }): void {
  const before = JSON.stringify(readShown(site));
  followAnchor(site, location.hash);
  if (JSON.stringify(readShown(site)) !== before) anchorOf(location.hash)?.scrollIntoView();
}

const todoSwitch = (event: Event): HTMLButtonElement | null =>
  event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.flavour-todo-switch') : null;

const headingLink = (event: Event): HTMLAnchorElement | null =>
  event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a.hash-link') : null;

/** A heading link carries every axis, so copying it or opening it in a new tab shows the same flavours. */
const fullLink = (link: HTMLAnchorElement): string => shareUrl(link.href, readShown(site));

if (typeof document !== 'undefined') {
  const refresh = (event: Event) => {
    const link = headingLink(event);
    if (link) link.href = fullLink(link);
  };
  document.addEventListener('pointerover', refresh);
  document.addEventListener('focusin', refresh);
  document.addEventListener('click', (event) => {
    const button = todoSwitch(event);
    if (button) {
      pickFlavours({ [button.dataset.axis!]: button.dataset.flavour! });
      document.getElementById(button.dataset.target!)?.scrollIntoView();
      return;
    }
    const link = headingLink(event);
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.replaceState(window.history.state, '', fullLink(link));
    anchorOf(new URL(link.href).hash)?.scrollIntoView();
  });
}
