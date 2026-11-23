# lsn-site

Site web de Labs Startup Nation : page d'accueil, Tech Watch (veille hebdomadaire), formulaire de proposition de projet, pages Projects, About, Join et pages légales. Site statique Astro, en anglais et en français.

## Lancer le site en local

Node 24 ou plus récent (`.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:4321
```

Copier `.env.example` en `.env` et renseigner les valeurs Supabase pour tester le formulaire.

## Tests

```bash
npm test           # tests unitaires (Vitest)
npm run test:e2e   # tests des pages dans un navigateur (Playwright)
```

## Publier un numéro de la Tech Watch

Voir [docs/publier-un-numero.md](docs/publier-un-numero.md).

## Avant la mise en ligne

Ce qui reste à faire, avec les comptes de LSN :

1. Renseigner `src/data/site.ts` (LinkedIn, e-mail, éditeur, directeur de la publication) et, si des membres ont donné leur accord écrit, `src/data/team.ts`. `npm run check:launch` doit afficher « all contact and legal values are set ».
2. Faire relire `/fr/legal` et `/fr/privacy` par un membre.
3. Supabase (projet en région UE) : `npx supabase link --project-ref <ref>` puis `npx supabase db push`. Vérifier dans le tableau de bord que RLS est active sur `proposals`.
4. Vercel (compte gratuit de LSN) : importer le dépôt GitHub, ajouter `SITE_URL`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (Production et Preview), activer *Web Analytics*.
5. Domaine : l'ajouter dans Vercel, configurer le DNS chez le registrar, attendre le HTTPS.
6. Google Search Console : vérifier le domaine, soumettre `https://<domaine>/sitemap-index.xml`.
7. Tester une proposition depuis le site en ligne et la retrouver dans Supabase.
8. Tester sur un iPhone et un Android réels, en clair et en sombre, avec « Réduire les animations ».

## Où sont les choses

- `src/content/issues/` : un fichier JSON par numéro, nommé par la date du lundi
- `src/i18n/` : tous les textes de l'interface, en anglais et en français
- `src/data/site.ts` : liens et coordonnées (LinkedIn, e-mail, délai de réponse)
- `supabase/migrations/` : la table qui reçoit les propositions
- `PLAN.md` et `docs/superpowers/plans/` : la spec et le plan d'implémentation
