require('dotenv').config();

/**
 * Configuration, validated at startup.
 *
 * Nothing here has a fallback any more. Every value this file used to default to
 * is public — this file is in a public repository — so a missing variable used to
 * mean the server came up with credentials anyone could read. It now refuses to
 * start instead, and refuses harder in production.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Secrets that were committed to the public repo and must never authenticate
 * anything again, even if someone pastes them back into a .env.
 *
 * The publishable Supabase key is deliberately absent: it is meant to be public
 * and needs no rotation. Its problem is that the API was using it in place of
 * the secret key, which is checked separately below.
 */
const COMPROMISED = new Set([
    'super-secret-key',
    'change-me-to-a-long-random-secret',
]);

const problems = [];
/** Fatal everywhere: without these the server cannot function at all. */
const fatal = (message) => problems.push(message);
/**
 * Fatal in production, a warning in development — so a local machine with a
 * short secret still runs, while a real deployment cannot.
 */
const productionOnly = (message) => {
    if (IS_PRODUCTION) problems.push(message);
    else console.warn(`[config] WARNING (would abort in production): ${message}`);
};

const required = (name) => {
    const value = process.env[name];
    if (!value) fatal(`${name} is not set`);
    else if (COMPROMISED.has(value)) {
        fatal(`${name} is a value that was published to the public repo — rotate it`);
    }
    return value;
};

const SUPABASE_URL = required('SUPABASE_URL');
const SUPABASE_KEY = required('SUPABASE_KEY');
const JWT_SECRET = required('JWT_SECRET');

// The publishable key is meant to be readable by anyone, so it only grants what
// Row Level Security allows. The API is the trusted server: it needs the secret
// key. Using the publishable one here either means RLS is off (so the public key
// can read and delete everything) or the API is about to start failing.
if (SUPABASE_KEY && /^(sb_publishable_|eyJ)/.test(SUPABASE_KEY) && !/^sb_secret_/.test(SUPABASE_KEY)) {
    productionOnly(
        'SUPABASE_KEY looks like a publishable/anon key. The API needs the secret ' +
        '(service_role) key — see migrations/004_enable_rls.sql'
    );
}

// 16 hex characters is 64 bits. Forging a token is an offline problem, so give
// it 256.
if (JWT_SECRET && JWT_SECRET.length < 32) {
    productionOnly(`JWT_SECRET is only ${JWT_SECRET.length} characters — use \`openssl rand -hex 32\``);
}

if (problems.length) {
    console.error('\n[config] Refusing to start:\n' + problems.map((p) => `  - ${p}`).join('\n'));
    console.error('\nSee backend/.env.example and DEPLOY.md.\n');
    process.exit(1);
}

module.exports = {
    PORT: process.env.PORT || 3000,
    SUPABASE_URL,
    SUPABASE_KEY,
    JWT_SECRET,
    // Falls back because it is not a credential — it only marks which account is
    // auto-promoted to admin, and the value is knowable from the app anyway.
    ADMIN_PHONE: process.env.ADMIN_PHONE || '01021317616',
    IS_PRODUCTION,
};
