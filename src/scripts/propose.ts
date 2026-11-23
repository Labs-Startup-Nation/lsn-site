import { submitProposal, validateProposal, type ProposalInput } from '../lib/proposal';

interface Messages { errors: Record<string, string>; submit: string; sending: string; success: string; error: string }

const ERROR_FIELDS: Record<string, string> = {
  name: 'p-name', email: 'p-email', organisation: 'p-org', problem: 'p-problem', first_version: 'p-v1', consent: 'p-consent',
};

export function initProposalForm(form = document.querySelector<HTMLFormElement>('#proposal')): void {
  if (!form) return;
  const messages = JSON.parse(form.dataset.messages ?? '{}') as Messages;
  const submit = form.querySelector<HTMLButtonElement>('#p-submit')!;
  const status = form.querySelector<HTMLElement>('#p-status')!;
  const alert = form.querySelector<HTMLElement>('#p-alert')!;
  const config = { url: import.meta.env.PUBLIC_SUPABASE_URL ?? '', anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '' };
  let sending = false;

  const clearErrors = () => {
    for (const id of Object.values(ERROR_FIELDS)) {
      document.getElementById(id)?.removeAttribute('aria-invalid');
      const err = document.getElementById(`${id}-error`);
      if (err) err.textContent = '';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    status.textContent = '';
    alert.textContent = '';
    clearErrors();

    const data = new FormData(form);
    const input: ProposalInput = {
      name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''),
      organisation: String(data.get('organisation') ?? ''), kind: String(data.get('kind') ?? ''),
      problem: String(data.get('problem') ?? ''), first_version: String(data.get('first_version') ?? ''),
      timing: String(data.get('timing') ?? ''), consent: data.get('consent') === 'on', website: String(data.get('website') ?? ''),
    };
    const result = validateProposal(input);

    if (!result.ok && result.spam) {
      // Pretend it worked so bots learn nothing.
      form.reset();
      status.textContent = messages.success;
      return;
    }
    if (!result.ok) {
      let first: HTMLElement | null = null;
      for (const [field, key] of Object.entries(result.errors)) {
        const id = ERROR_FIELDS[field];
        const el = id ? document.getElementById(id) : null;
        if (!el) continue;
        el.setAttribute('aria-invalid', 'true');
        const err = document.getElementById(`${id}-error`);
        if (err) err.textContent = messages.errors[key] ?? key;
        first ??= el;
      }
      // Focus the first invalid field in document order.
      const ordered = Object.values(ERROR_FIELDS).map((id) => document.getElementById(id)).find((el) => el?.getAttribute('aria-invalid') === 'true');
      (ordered ?? first)?.focus();
      return;
    }

    sending = true;
    submit.disabled = true;
    submit.textContent = messages.sending;
    const sent = await submitProposal(result.value, config);
    sending = false;
    submit.disabled = false;
    submit.textContent = messages.submit;
    if (sent.ok) {
      form.reset();
      status.textContent = messages.success;
    } else {
      alert.textContent = messages.error;
    }
  });
}
