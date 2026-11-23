import { describe, expect, test } from 'vitest';
import { ui, t } from '../../src/i18n/ui';
import { pickLang, localePath, swapLang, langStaticPaths } from '../../src/i18n/lang';

describe('ui strings', () => {
  test('fr and en have exactly the same keys', () => {
    expect(Object.keys(ui.fr).sort()).toEqual(Object.keys(ui.en).sort());
  });
  test('no empty string in either language', () => {
    for (const lang of ['en', 'fr'] as const) {
      for (const [key, value] of Object.entries(ui[lang])) expect(value, `${lang}.${key}`).not.toBe('');
    }
  });
  test('t returns the string for the language', () => {
    expect(t('en', 'nav.about')).toBe('About');
    expect(t('fr', 'nav.about')).toBe('À propos');
  });
});

describe('pickLang', () => {
  test.each([
    [['fr-FR', 'en'], 'fr'],
    [['de-DE', 'fr'], 'fr'],
    [['de-DE'], 'en'],
    [[], 'en'],
    [['FR'], 'fr'],
    [['en-GB', 'fr'], 'en'],
  ])('%j -> %s', (accepted, expected) => {
    expect(pickLang(accepted)).toBe(expected);
  });
});

describe('paths', () => {
  test('localePath prefixes the language', () => {
    expect(localePath('fr', '/about')).toBe('/fr/about');
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('en', '/tech-watch/2026-10-26')).toBe('/en/tech-watch/2026-10-26');
  });
  test('swapLang keeps the page', () => {
    expect(swapLang('/en/tech-watch/2026-10-26', 'fr')).toBe('/fr/tech-watch/2026-10-26');
    expect(swapLang('/fr/about/', 'en')).toBe('/en/about/');
    expect(swapLang('/en', 'fr')).toBe('/fr/');
    expect(swapLang('/en/', 'fr')).toBe('/fr/');
  });
  test('langStaticPaths lists both languages', () => {
    expect(langStaticPaths()).toEqual([{ params: { lang: 'en' } }, { params: { lang: 'fr' } }]);
  });
});
