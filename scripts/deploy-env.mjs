// Vercel builds must not ship localhost links or a form that cannot send.
const REQUIRED = ['SITE_URL', 'PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY'];

export function missingDeployEnv(env) {
  return REQUIRED.filter((key) => !env[key] || (key === 'SITE_URL' && /localhost|127\.0\.0\.1/.test(env[key])));
}

export function assertDeployEnv(env) {
  if (!env.VERCEL) return;
  const missing = missingDeployEnv(env);
  if (missing.length) throw new Error(`Missing environment variables on Vercel: ${missing.join(', ')}`);
}
