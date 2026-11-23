import type { UiKey } from '../i18n/ui';

export const NAV: { path: string; key: UiKey }[] = [
  { path: '/tech-watch', key: 'nav.techWatch' },
  { path: '/propose', key: 'nav.propose' },
  { path: '/projects', key: 'nav.projects' },
  { path: '/about', key: 'nav.about' },
  { path: '/join', key: 'nav.join' },
];

/** True when `pathname` (with language prefix) is `path` or one of its sub-pages. */
export function isCurrent(pathname: string, path: string): boolean {
  const rest = pathname.replace(/^\/(en|fr)/, '').replace(/\/$/, '') || '/';
  return rest === path || rest.startsWith(`${path}/`);
}
