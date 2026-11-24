import { describe, expect, test } from 'vitest';
import { validateProposal, MAX_LENGTHS, type ProposalInput } from '../../src/lib/proposal';

const valid: ProposalInput = {
  name: '  Ada Lovelace ', email: 'ada@example.org', organisation: '', kind: 'app',
  problem: 'Our association tracks members in a spreadsheet.', first_version: '', timing: 'none',
  consent: true, website: '',
};

describe('validateProposal', () => {
  test('valid input is trimmed and empty optional fields become null', () => {
    const r = validateProposal(valid);
    expect(r).toEqual({ ok: true, value: {
      name: 'Ada Lovelace', email: 'ada@example.org', organisation: null, kind: 'app',
      problem: 'Our association tracks members in a spreadsheet.', first_version: null, timing: 'none', consent: true,
    } });
  });

  test('required fields', () => {
    const r = validateProposal({ ...valid, name: ' ', email: '', problem: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toEqual({ name: 'form.errRequired', email: 'form.errRequired', problem: 'form.errRequired' });
  });

  test('email format', () => {
    const r = validateProposal({ ...valid, email: 'foo' });
    expect(!r.ok && r.errors.email).toBe('form.errEmail');
  });

  test('length limits', () => {
    expect(validateProposal({ ...valid, problem: 'x'.repeat(MAX_LENGTHS.problem) }).ok).toBe(true);
    const r = validateProposal({ ...valid, problem: 'x'.repeat(MAX_LENGTHS.problem + 1) });
    expect(!r.ok && r.errors.problem).toBe('form.errTooLong');
    expect(MAX_LENGTHS).toEqual({ name: 120, email: 254, organisation: 160, problem: 4000, first_version: 2000 });
  });

  test('consent is required', () => {
    const r = validateProposal({ ...valid, consent: false });
    expect(!r.ok && r.errors.consent).toBe('form.errConsent');
  });

  test('unknown kind or timing is rejected', () => {
    expect(validateProposal({ ...valid, kind: 'spaceship' }).ok).toBe(false);
    expect(validateProposal({ ...valid, timing: 'yesterday' }).ok).toBe(false);
  });

  test('honeypot filled means spam, with no field errors', () => {
    expect(validateProposal({ ...valid, website: 'http://spam.example' })).toEqual({ ok: false, spam: true, errors: {} });
  });
});

import { submitProposal } from '../../src/lib/proposal';

describe('submitProposal', () => {
  const row = { name: 'Ada', email: 'ada@example.org', organisation: null, kind: 'app', problem: 'P', first_version: null, timing: 'none', consent: true } as const;
  const cfg = { url: 'https://abc.supabase.co', anonKey: 'anon-key' };

  test('posts the row to the REST endpoint without asking for it back', async () => {
    const calls: [string, RequestInit][] = [];
    const fake = async (url: string, init: RequestInit) => { calls.push([url, init]); return new Response(null, { status: 201 }); };
    expect(await submitProposal(row, cfg, fake as typeof fetch)).toEqual({ ok: true });
    const [url, init] = calls[0];
    expect(url).toBe('https://abc.supabase.co/rest/v1/proposals');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ apikey: 'anon-key', Authorization: 'Bearer anon-key', 'Content-Type': 'application/json', Prefer: 'return=minimal' });
    expect(JSON.parse(init.body as string)).toEqual(row);
  });

  test('server error is reported, not thrown', async () => {
    const fake = async () => new Response('{"message":"boom"}', { status: 500 });
    expect(await submitProposal(row, cfg, fake as unknown as typeof fetch)).toEqual({ ok: false, message: 'HTTP 500' });
  });

  test('network failure is reported, not thrown', async () => {
    const fake = async () => { throw new TypeError('Failed to fetch'); };
    expect(await submitProposal(row, cfg, fake as unknown as typeof fetch)).toEqual({ ok: false, message: 'Failed to fetch' });
  });

  test('missing configuration fails cleanly', async () => {
    expect(await submitProposal(row, { url: '', anonKey: '' })).toEqual({ ok: false, message: 'Form is not configured' });
  });
});

describe('submitProposal timeout', () => {
  test('a stalled request gives up and reports it', async () => {
    const row = { name: 'Ada', email: 'a@b.co', organisation: null, kind: 'app', problem: 'P', first_version: null, timing: 'none', consent: true } as const;
    const stalled = (_url: string, init: RequestInit) => new Promise<Response>((_, reject) => {
      init.signal?.addEventListener('abort', () => reject(new DOMException('The operation timed out.', 'TimeoutError')));
    });
    const r = await submitProposal(row, { url: 'https://x.supabase.co', anonKey: 'k' }, stalled as typeof fetch, 50);
    expect(r).toEqual({ ok: false, message: 'Timeout' });
  });
});

describe('submitProposal on older browsers', () => {
  test('still sends when AbortSignal.timeout does not exist (Safari < 16)', async () => {
    const original = AbortSignal.timeout;
    // @ts-expect-error simulating an older browser
    AbortSignal.timeout = undefined;
    try {
      const row = { name: 'Ada', email: 'a@b.co', organisation: null, kind: 'app', problem: 'P', first_version: null, timing: 'none', consent: true } as const;
      const ok = async () => new Response(null, { status: 201 });
      expect(await submitProposal(row, { url: 'https://x.supabase.co', anonKey: 'k' }, ok as unknown as typeof fetch)).toEqual({ ok: true });
    } finally {
      AbortSignal.timeout = original;
    }
  });
});
