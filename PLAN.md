# Site LSN — plan d'implémentation V1

Ce plan sert à construire le vrai site de Labs Startup Nation à partir de la maquette validée et du design system. Chaque tâche est courte, indique les fichiers touchés et se termine par un critère vérifiable. On les fait dans l'ordre : chacune s'appuie sur les précédentes.

**Références**
- Maquette navigable : https://claude.ai/artifact/8WnPxiazUkiVZBZK9aqSAs
- Design system : https://claude.ai/artifact/MVC91Z93UcS1C7Rr6RyHsb
- Newsletter semaine 44 (premier numéro à importer) : https://claude.ai/artifact/LyYoZSSfpFJumsxEX9Gftd
- Logos : `../logo/` (SVG et PNG)

## Hypothèses (à confirmer par l'équipe avant la tâche 1)

| # | Décision | Hypothèse retenue dans ce plan | Si on choisit autrement |
|---|---|---|---|
| H1 | Framework | **Astro** (site statique, collections de contenu) | Next.js : les tâches 3 à 8 changent de syntaxe, pas de structure |
| H2 | Publication du lundi | **Un fichier JSON par numéro** dans `src/content/issues/`, poussé sur GitHub | CMS : ajouter une tâche de configuration après la tâche 6 |
| H3 | Formulaire | **Supabase** (table `proposals`, insertion seule) | Tally ou Formspree : la tâche 9 devient un simple branchement |
| H4 | Langue | **Anglais seulement** en V1 | FR + EN : ajouter l'i18n d'Astro avant la tâche 5 |
| H5 | Hébergement | **Vercel**, compte d'équipe LSN | Netlify ou Cloudflare Pages : seule la tâche 12 change |
| H6 | Domaine | À choisir (`<domaine>` dans ce plan) | — |

Les comptes (GitHub, Vercel, Supabase, registrar du domaine) appartiennent à LSN, pas à une personne. Au moins deux membres y ont un accès administrateur.

---

## Tâche 0 — Rassembler les contenus manquants

Pas de code. Ce sont les éléments en pointillés bleus de la maquette.

- [ ] URL de la page LinkedIn LSN
- [ ] Adresse e-mail de contact (idéalement sur le domaine, sinon une adresse dédiée)
- [ ] Membres de l'équipe : nom, rôle, études, photo, **accord écrit pour la publication**
- [ ] Statut de l'association (créée, en cours, date)
- [ ] Anciens numéros de la Tech Watch à importer (fichiers ou liens)
- [ ] Origine et droits des images de l'ancienne newsletter (`img/`). Sans droits clairs, on ne les réutilise pas : le rayon suffit.
- [ ] Nom du directeur de la publication (mentions légales)

**Fini quand** tout est rassemblé dans un dossier partagé, ou marqué « pas en V1 ».

## Tâche 1 — Comptes et dépôt

- [ ] Créer l'organisation GitHub LSN et le dépôt `lsn-site` (public ou privé, au choix)
- [ ] Créer l'équipe Vercel et le projet Supabase (région UE, par exemple `eu-west`)
- [ ] Acheter le domaine au nom de LSN, chez un registrar qui permet de gérer le DNS
- [ ] Ajouter un fichier `README.md` d'une page : à quoi sert le dépôt, comment lancer le site, comment publier un numéro

**Fini quand** deux membres peuvent pousser sur le dépôt et administrer Vercel et Supabase.

## Tâche 2 — Initialiser le projet Astro

Fichiers : `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.nvmrc`

- [ ] Node 20 LTS ou plus récent ; épingler la version dans `.nvmrc`
- [ ] `npm create astro@latest`, modèle minimal, TypeScript strict
- [ ] Ajouter les intégrations `@astrojs/sitemap` et `@astrojs/rss`
- [ ] Polices **auto-hébergées** avec `@fontsource/unbounded`, `@fontsource/outfit` et `@fontsource/dm-mono` plutôt que Google Fonts : aucune adresse IP de visiteur n'est envoyée à Google, ce qui simplifie le RGPD
- [ ] Configurer `site: 'https://<domaine>'` dans `astro.config.mjs`

**Fini quand** `npm run dev` affiche la page d'accueil par défaut et `npm run build` passe.

## Tâche 3 — Tokens et styles globaux

Fichiers : `src/styles/tokens.css`, `src/styles/global.css`

- [ ] Recopier les tokens de `tokens.json` (design system) en variables CSS, avec les deux thèmes : clair sur `:root`, Nuit chaude sous `@media (prefers-color-scheme: dark)`
- [ ] Inclure les valeurs à jour : `smoke` à 0,62, `smoke-ink` `#FFFBF2`, `smoke-ink-soft` `#FAF3E6`
- [ ] Styles de base : fond `surface`, texte `ink`, échelle typographique, anneau de focus `focus` + halo `focus-halo`
- [ ] Gouttières latérales : `max(16px, env(safe-area-inset-left))`

**Fini quand** une page de test affiche les trois polices et les couleurs dans les deux thèmes.

## Tâche 4 — Composants de marque

Fichiers : `src/components/*.astro`, `src/scripts/beam.ts`

| Composant | Rôle | Source |
|---|---|---|
| `Beam.astro` + `beam.ts` | Le rayon tramé animé, dans un canvas | Code de la maquette : palette solaire, diagonale, décalage `shift`, pause hors écran avec IntersectionObserver, figé si `prefers-reduced-motion` |
| `Smoke.astro` | Le verre fumé | Repli opaque avec `@supports` et `@media print` |
| `Label.astro` | Étiquette DM Mono | Tons `sun`, `fire`, `ink` |
| `Button.astro` | Bouton ou lien | Variantes `sun`, `sky`, `ink`, `ghost` |
| `SectionTitle.astro` | Titre avec le trio de carrés | Prop `accent` |
| `Logo.astro` | Logo inline | SVG de `../logo/`, versions `ink` et `cream` |
| `StoryCard.astro`, `ArticleCard.astro`, `StatCard.astro` | Cartes de la veille | Maquette et newsletter |

- [ ] Un seul script `beam.ts` pour toute la page, qui anime tous les rayons visibles (pas un script par composant)
- [ ] Le canvas est `aria-hidden`, le texte reste dans le HTML

**Fini quand** une page `/dev/components` (exclue du sitemap et non liée) montre chaque composant et ses états.

## Tâche 5 — Mise en page et navigation

Fichiers : `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] `Base.astro` : `<html lang="en">`, balises meta, Open Graph (image : le bandeau LinkedIn « symbole »), favicon `lsn-symbol`
- [ ] En-tête collant avec le logo, les liens (Tech Watch, Propose a project, Projects, About, Join) et la page courante marquée `aria-current`
- [ ] Pied de page avec les liens et les mentions légales
- [ ] Une vraie URL par page (`/tech-watch`, `/propose`…) à la place des ancres `#` de la maquette

**Fini quand** on navigue entre des pages vides au clavier et sur mobile, sans défilement horizontal.

## Tâche 6 — Collection Tech Watch

Fichiers : `src/content.config.ts`, `src/content/issues/2026-10-26.json`

- [ ] Définir le schéma d'un numéro avec zod :
  - `date`, `week`, `title`, `oneLine`
  - `topStories[]` : `label`, `title`, `text`, `url`
  - `sections[]` : `id`, `title`, `accent`, `articles[]`
  - `articles[]` : `label`, `title`, `text`, `why`, `figure`, `figureLabel`, `url`, `sources[]` (`name`, `url`)
  - `note?`, `agenda[]` (`date`, `title`, `url`, `text`)
  - `concept` (`name`, `whatItIs`, `thinkOfIt`, `seenThisWeek`, `inPractice`)
  - `number` (`value`, `text`, `source`)
  - `terms[]` (`term`, `definition`)
  - `pdf?` (chemin du carrousel)
- [ ] Le build échoue si un numéro ne respecte pas le schéma : c'est le garde-fou de la publication du lundi
- [ ] Convertir le numéro de la semaine 44 depuis la page HTML de la newsletter

**Fini quand** `npm run build` valide le fichier de la semaine 44.

## Tâche 7 — Pages Tech Watch

Fichiers : `src/pages/tech-watch/index.astro`, `src/pages/tech-watch/[slug].astro`, `src/pages/rss.xml.ts`

- [ ] `/tech-watch` : le dernier numéro mis en avant, les rubriques, l'archive triée par date
- [ ] `/tech-watch/2026-10-26` : le numéro complet, rendu comme la newsletter (en-tête, top stories, sections, agenda, concept, chiffre, lexique)
- [ ] Lien vers le carrousel PDF quand `pdf` est renseigné
- [ ] Flux RSS des numéros

**Fini quand** la page du numéro 44 reprend tout le contenu de la newsletter, et que le flux RSS est valide.

## Tâche 8 — Pages Accueil, Projects, About, Join

Fichiers : `src/pages/index.astro`, `projects.astro`, `about.astro`, `join.astro`, `src/content/projects/` (vide)

- [ ] Accueil : reprendre la maquette. Les top stories et le chiffre de la semaine viennent **automatiquement** du dernier numéro.
- [ ] Projects : état vide, format des hackathons, et une collection `projects` prête mais vide
- [ ] About : texte, outils, principes, et la section Équipe seulement si des membres ont donné leur accord
- [ ] Join : vrais liens LinkedIn et contact (tâche 0)

**Fini quand** aucune mention « À compléter » ne reste dans le site.

## Tâche 9 — Formulaire de proposition

Fichiers : `src/pages/propose.astro`, `src/scripts/propose.ts`, `supabase/migrations/001_proposals.sql`, `.env.example`

- [ ] Table `proposals` :
  - colonnes : `id`, `created_at`, `name`, `email`, `organisation`, `kind`, `problem`, `first_version`, `timing`, `consent`, `status`
  - `status` vaut `new` par défaut
- [ ] Sécurité (RLS) : le visiteur anonyme peut **seulement insérer**, jamais lire. La lecture se fait depuis le tableau de bord Supabase par l'équipe.
- [ ] Clés publiques dans `PUBLIC_SUPABASE_URL` et `PUBLIC_SUPABASE_ANON_KEY` (Vercel), jamais la clé `service_role` côté client
- [ ] Anti-spam : un champ piège caché et une longueur maximale par champ
- [ ] Case de consentement obligatoire, avec un lien vers la politique de confidentialité
- [ ] États clairs : envoi en cours, succès (« Thanks, we’ll answer within … » — délai à fixer), erreur avec quoi faire
- [ ] Plus tard : notification e-mail à l'équipe (Edge Function + service d'envoi)

**Fini quand** une proposition envoyée depuis le site apparaît dans Supabase, et qu'une requête de lecture anonyme est refusée.

## Tâche 10 — Pages légales

Fichiers : `src/pages/legal.astro`, `src/pages/privacy.astro`

- [ ] Mentions légales : éditeur (LSN ou ses responsables tant que l'association n'existe pas), directeur de la publication, hébergeur (Vercel Inc., avec son adresse)
- [ ] Politique de confidentialité du formulaire :
  - quelles données, pourquoi, pendant combien de temps (proposition : 12 mois) ;
  - qui y a accès ;
  - comment demander leur suppression ;
  - stockage chez Supabase en UE
- [ ] Pas de cookie de mesure d'audience, donc pas de bandeau de consentement

**Fini quand** les deux pages sont relues par au moins un membre et liées depuis le pied de page et le formulaire.

## Tâche 11 — Qualité

- [ ] Lighthouse (mobile) au-dessus de 90 en performance, accessibilité, bonnes pratiques et SEO, sur l'accueil et sur un numéro
- [ ] Contrôle axe : aucune erreur
- [ ] Navigation complète au clavier, focus visible partout
- [ ] Test sur iPhone et Android réels, en clair et en sombre
- [ ] Animations figées avec « réduire les animations » activé
- [ ] Le rayon ne dégrade pas la fluidité du défilement sur un téléphone d'entrée de gamme ; sinon, réduire le nombre d'images par seconde

**Fini quand** toutes les cases sont cochées ou qu'un ticket existe pour chaque écart accepté.

## Tâche 12 — Mise en ligne

- [ ] Connecter le dépôt à Vercel, ajouter les variables d'environnement
- [ ] Chaque pull request génère une prévisualisation, et `main` est publié en production
- [ ] Brancher le domaine (DNS), HTTPS automatique
- [ ] Activer une mesure d'audience sans cookies
- [ ] Soumettre le sitemap à Google Search Console

**Fini quand** `https://<domaine>` sert le site et que la page du numéro 44 se partage sur LinkedIn avec la bonne image.

## Tâche 13 — Procédure du lundi

Fichier : `docs/publier-un-numero.md`

1. Produire le numéro au format JSON du schéma (Claude peut le générer en même temps que la veille).
2. L'ajouter dans `src/content/issues/AAAA-MM-JJ.json` et le carrousel dans `public/pdf/`.
3. Ouvrir une pull request, vérifier la prévisualisation Vercel, puis fusionner.
4. Poster sur LinkedIn avec le lien `/tech-watch/AAAA-MM-JJ`.

**Fini quand** un membre qui n'a pas construit le site publie seul un numéro en suivant le document.

---

## Estimation

Environ 4 semaines à quelques heures par semaine. C'est une estimation indicative, qui dépend surtout de la tâche 0 et de la conversion des anciens numéros.

| Semaine | Tâches |
|---|---|
| S1 | 0, 1, 2, 3 |
| S2 | 4, 5 |
| S3 | 6, 7, 8 |
| S4 | 9, 10, 11, 12, 13 |
