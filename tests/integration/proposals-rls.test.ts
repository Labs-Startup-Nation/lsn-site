import { beforeAll, describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

// Emulates what Supabase sets up before migrations: the `anon` role and its default grants on public tables.
const SUPABASE_PRELUDE = `
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
`;

const row = {
  name: 'Ada', email: 'ada@example.org', organisation: null, kind: 'app',
  problem: 'A problem.', first_version: null, timing: 'none', consent: true,
};

let db: PGlite;

async function asAnon<T>(fn: () => Promise<T>): Promise<T> {
  await db.exec('set role anon');
  try { return await fn(); } finally { await db.exec('reset role'); }
}

function insert(values: Record<string, unknown>) {
  const cols = Object.keys(values);
  const params = cols.map((_, i) => `$${i + 1}`).join(', ');
  return db.query(`insert into public.proposals (${cols.join(', ')}) values (${params})`, Object.values(values));
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_PRELUDE);
  await db.exec(readFileSync('supabase/migrations/001_proposals.sql', 'utf8'));
});

describe('proposals table as an anonymous visitor', () => {
  test('can insert a valid proposal', async () => {
    await expect(asAnon(() => insert(row))).resolves.toBeDefined();
  });

  test('cannot read any proposal', async () => {
    await insert(row); // as owner
    const visible = await asAnon(async () => {
      try { return (await db.query('select * from public.proposals')).rows; } catch { return []; }
    });
    expect(visible).toEqual([]);
    expect((await db.query('select count(*)::int as n from public.proposals')).rows[0]).toEqual({ n: 2 });
  });

  test('cannot choose the status', async () => {
    await expect(asAnon(() => insert({ ...row, status: 'accepted' }))).rejects.toThrow();
  });

  test('cannot insert without consent', async () => {
    await expect(asAnon(() => insert({ ...row, consent: false }))).rejects.toThrow();
  });

  test('cannot insert an unknown kind', async () => {
    await expect(asAnon(() => insert({ ...row, kind: 'spaceship' }))).rejects.toThrow();
  });

  test('cannot exceed the length limits', async () => {
    await expect(asAnon(() => insert({ ...row, problem: 'x'.repeat(4001) }))).rejects.toThrow();
  });

  test('cannot change or remove rows', async () => {
    await expect(asAnon(() => db.query("update public.proposals set status = 'accepted'"))).rejects.toThrow();
    await expect(asAnon(() => db.query('truncate public.proposals'))).rejects.toThrow();
    const removed = await asAnon(async () => {
      try { return (await db.query('DELETE FROM public.proposals')).affectedRows ?? 0; } catch { return 0; }
    });
    expect(removed).toBe(0);
  });

  test('new rows get status new', async () => {
    const { rows } = await db.query<{ status: string }>('select distinct status from public.proposals');
    expect(rows).toEqual([{ status: 'new' }]);
  });
});
