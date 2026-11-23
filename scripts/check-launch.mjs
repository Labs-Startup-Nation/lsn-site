// Lists the values in src/data/site.ts the team must fill before the site goes live.
// Usage: npm run check:launch  (exits 1 when something is missing)
import { pathToFileURL } from 'node:url';

const REQUIRED = ['LINKEDIN_URL', 'CONTACT_EMAIL', 'PUBLISHER', 'PUBLICATION_DIRECTOR'];

export function missingForLaunch(values) {
  return REQUIRED.filter((key) => values[key] == null || values[key] === '');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const site = await import('../src/data/site.ts');
  const missing = missingForLaunch(site);
  if (missing.length) {
    console.error(`Missing in src/data/site.ts before launch: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('Launch check: all contact and legal values are set.');
}
