# Publier un numéro de la Tech Watch

Chaque lundi, en quatre étapes. Compter 10 minutes une fois le numéro rédigé.

## 1. Préparer le fichier du numéro

Un numéro est un fichier JSON nommé par **la date du lundi** : `AAAA-MM-JJ.json` (par exemple `2026-11-02.json`).

- Partir du numéro précédent (`src/content/issues/2026-10-26.json`) et remplacer le contenu, ou demander à Claude de produire la veille « au format JSON du schéma de `src/lib/issue-schema.ts` ».
- Le champ `date` doit être **exactement** le nom du fichier (`"date": "2026-11-02"`), sinon le site refuse de se construire.
- Tous les liens commencent par `https://`.
- Les rubriques sans article peuvent rester avec `"articles": []` : elles n'apparaissent pas sur le site. Même chose pour `agenda` et `terms` vides.
- Le numéro reste en anglais. La version française du site affiche « Ce numéro est rédigé en anglais. »

Si le carrousel PDF existe, le placer dans `public/pdf/AAAA-MM-JJ.pdf` et ajouter au numéro :

```json
"pdf": "/pdf/2026-11-02.pdf"
```

## 2. Vérifier en local (facultatif mais conseillé)

```bash
npm run build
```

Si le fichier a une erreur, la commande s'arrête et dit où. Exemple :

```
[InvalidContentEntryDataError] issues → 2026-11-02 data does not match collection schema.
  date: Must be YYYY-MM-DD
  topStories.0.url: Must be an https:// URL
```

Lecture : dans le fichier `2026-11-02.json`, le champ `date` n'est pas au format `AAAA-MM-JJ`, et le lien de la **première** top story (`topStories.0`, on compte à partir de 0) ne commence pas par `https://`.

## 3. Ouvrir une pull request

Sur GitHub, créer une branche, ajouter le fichier (et le PDF), puis ouvrir une pull request.

- Les tests se lancent tout seuls (onglet *Checks*). Ils doivent être verts.
- Vercel publie une **prévisualisation** : le lien apparaît dans la pull request. Ouvrir `/en/tech-watch/AAAA-MM-JJ` sur ce lien et relire le numéro, sur téléphone aussi.
- Fusionner la pull request : le site en ligne est mis à jour en une à deux minutes. L'accueil affiche automatiquement les top stories et le chiffre de la semaine du nouveau numéro.

## 4. Poster sur LinkedIn

Poster le carrousel et le résumé de la semaine, avec le lien :

```
https://<domaine>/en/tech-watch/AAAA-MM-JJ
```

L'aperçu LinkedIn (titre, image) se règle tout seul. En cas de doute, le vérifier avec le *Post Inspector* de LinkedIn.
