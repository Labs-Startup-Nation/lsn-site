export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** First accepted language tag whose primary subtag we support; English otherwise. */
export function pickLang(accepted: readonly string[]): Lang {
  for (const tag of accepted) {
    const primary = tag.trim().toLowerCase().split(/[-_;]/)[0];
    if (isLang(primary)) return primary;
  }
  return DEFAULT_LANG;
}

/** `localePath('fr', '/about')` → `/fr/about`. */
export function localePath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`;
}

/** Same page in the other language: `/en/tech-watch/x` → `/fr/tech-watch/x`. */
export function swapLang(pathname: string, to: Lang): string {
  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, '');
  return `/${to}${rest === '' ? '/' : rest}`;
}

export function langStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}
