import { expect, test } from 'vitest';
import { missingDeployEnv, assertDeployEnv } from '../../scripts/deploy-env.mjs';

const full = { VERCEL: '1', SITE_URL: 'https://lsn.example', PUBLIC_SUPABASE_URL: 'https://x.supabase.co', PUBLIC_SUPABASE_ANON_KEY: 'k' };

test('lists missing or localhost values', () => {
  expect(missingDeployEnv(full)).toEqual([]);
  expect(missingDeployEnv({ VERCEL: '1' })).toEqual(['SITE_URL', 'PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY']);
  expect(missingDeployEnv({ ...full, SITE_URL: 'http://localhost:4321' })).toEqual(['SITE_URL']);
});

test('only Vercel builds are blocked', () => {
  expect(() => assertDeployEnv({})).not.toThrow();
  expect(() => assertDeployEnv({ VERCEL: '1', SITE_URL: 'https://lsn.example' })).toThrow(
    'Missing environment variables on Vercel: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY',
  );
});
