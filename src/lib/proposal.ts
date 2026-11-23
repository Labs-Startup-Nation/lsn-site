import type { UiKey } from '../i18n/ui';

export const KINDS = ['app', 'site', 'tool', 'automation', 'other'] as const;
export const TIMINGS = ['none', 'month', 'quarter', 'fixed'] as const;
export const MAX_LENGTHS = { name: 120, email: 254, organisation: 160, problem: 4000, first_version: 2000 } as const;

export interface ProposalInput {
  name: string; email: string; organisation: string; kind: string; problem: string;
  first_version: string; timing: string; consent: boolean;
  /** Honeypot: hidden from people, filled by bots. */
  website: string;
}

export interface ProposalRow {
  name: string; email: string; organisation: string | null; kind: (typeof KINDS)[number]; problem: string;
  first_version: string | null; timing: (typeof TIMINGS)[number]; consent: true;
}

type Field = keyof ProposalInput;
export type ProposalResult =
  | { ok: true; value: ProposalRow }
  | { ok: false; errors: Partial<Record<Field, UiKey>>; spam?: true };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProposal(input: ProposalInput): ProposalResult {
  if (input.website.trim() !== '') return { ok: false, spam: true, errors: {} };
  const v = {
    name: input.name.trim(), email: input.email.trim(), organisation: input.organisation.trim(),
    problem: input.problem.trim(), first_version: input.first_version.trim(),
  };
  const errors: Partial<Record<Field, UiKey>> = {};
  for (const f of ['name', 'email', 'problem'] as const) if (!v[f]) errors[f] = 'form.errRequired';
  if (v.email && !EMAIL.test(v.email)) errors.email = 'form.errEmail';
  for (const f of Object.keys(MAX_LENGTHS) as (keyof typeof MAX_LENGTHS)[]) {
    if (v[f].length > MAX_LENGTHS[f]) errors[f] = 'form.errTooLong';
  }
  if (!(KINDS as readonly string[]).includes(input.kind)) errors.kind = 'form.errRequired';
  if (!(TIMINGS as readonly string[]).includes(input.timing)) errors.timing = 'form.errRequired';
  if (!input.consent) errors.consent = 'form.errConsent';
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name: v.name, email: v.email, organisation: v.organisation || null, kind: input.kind as ProposalRow['kind'],
      problem: v.problem, first_version: v.first_version || null, timing: input.timing as ProposalRow['timing'], consent: true,
    },
  };
}

export interface SupabaseConfig { url: string; anonKey: string }

/**
 * Inserts through Supabase's REST API without reading the row back (`return=minimal`):
 * anonymous visitors may insert but never select. Never throws.
 */
export async function submitProposal(
  row: ProposalRow, cfg: SupabaseConfig, fetchFn: typeof fetch = fetch,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!cfg.url || !cfg.anonKey) return { ok: false, message: 'Form is not configured' };
  try {
    const res = await fetchFn(`${cfg.url.replace(/\/$/, '')}/rest/v1/proposals`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    return res.ok ? { ok: true } : { ok: false, message: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
