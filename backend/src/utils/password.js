const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/** bcrypt hashes are self-describing: $2a$/$2b$/$2y$ + cost + 53 chars of salt|digest. */
const BCRYPT_PATTERN = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;

const isHashed = (value) => typeof value === 'string' && BCRYPT_PATTERN.test(value);

const hash = (plain) => bcrypt.hash(String(plain), SALT_ROUNDS);

/**
 * Check a submitted password against what is stored.
 *
 * Rows written before hashing existed hold the password verbatim, so those are
 * compared directly. `needsUpgrade` tells the caller to re-store a real hash —
 * see AuthService.login, which does that on the next successful sign-in.
 */
async function verify(plain, stored) {
    if (!plain || !stored) return { ok: false, needsUpgrade: false };

    if (isHashed(stored)) {
        return { ok: await bcrypt.compare(String(plain), stored), needsUpgrade: false };
    }

    const ok = String(plain) === String(stored);
    return { ok, needsUpgrade: ok };
}

module.exports = { hash, verify, isHashed, SALT_ROUNDS };
