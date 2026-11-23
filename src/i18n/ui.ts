import type { Lang } from './lang';

const en = {
  'site.name': 'Labs Startup Nation',
  'site.description': 'Students who follow tech closely, and build with it: a weekly tech watch, one-day hackathons and side projects.',
  'skip': 'Skip to content',
  'nav.label': 'Main',
  'nav.techWatch': 'Tech Watch',
  'nav.propose': 'Propose a project',
  'nav.projects': 'Projects',
  'nav.about': 'About',
  'nav.join': 'Join',
  'nav.home': 'LSN, home',
  'footer.label': 'Footer',
  'footer.place': 'Labs Startup Nation · Paris',
  'footer.legal': 'Legal notice',
  'footer.privacy': 'Privacy',
  'lang.label': 'Language',
  'lang.other': 'Français',
  'lang.otherShort': 'FR',
  'notFound.title': 'Page not found',
  'notFound.text': 'This page does not exist, or it has moved.',
  'notFound.back': 'Back to the home page',
} as const;

export type UiKey = keyof typeof en;

const fr: Record<UiKey, string> = {
  'site.name': 'Labs Startup Nation',
  'site.description': 'Des étudiants qui suivent la tech de près, et qui construisent avec : une veille tech chaque semaine, des hackathons d’une journée et des projets.',
  'skip': 'Aller au contenu',
  'nav.label': 'Principal',
  'nav.techWatch': 'Veille tech',
  'nav.propose': 'Proposer un projet',
  'nav.projects': 'Projets',
  'nav.about': 'À propos',
  'nav.join': 'Nous rejoindre',
  'nav.home': 'LSN, accueil',
  'footer.label': 'Pied de page',
  'footer.place': 'Labs Startup Nation · Paris',
  'footer.legal': 'Mentions légales',
  'footer.privacy': 'Confidentialité',
  'lang.label': 'Langue',
  'lang.other': 'English',
  'lang.otherShort': 'EN',
  'notFound.title': 'Page introuvable',
  'notFound.text': 'Cette page n’existe pas, ou elle a été déplacée.',
  'notFound.back': 'Retour à l’accueil',
};

export const ui: Record<Lang, Record<UiKey, string>> = { en, fr };

export function t(lang: Lang, key: UiKey): string {
  return ui[lang][key];
}
