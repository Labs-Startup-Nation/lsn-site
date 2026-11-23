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

## Où sont les choses

- `src/content/issues/` : un fichier JSON par numéro, nommé par la date du lundi
- `src/i18n/` : tous les textes de l'interface, en anglais et en français
- `src/data/site.ts` : liens et coordonnées (LinkedIn, e-mail, délai de réponse)
- `supabase/migrations/` : la table qui reçoit les propositions
- `PLAN.md` et `docs/superpowers/plans/` : la spec et le plan d'implémentation
