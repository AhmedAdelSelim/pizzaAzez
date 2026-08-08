/**
 * Username rules.
 *
 * Deliberately narrow: Latin letters, digits, underscore and dot, 3–20 chars,
 * starting with a letter. Arabic names live in `name` — this is a handle, and
 * keeping it ASCII avoids look-alike-character impersonation between visually
 * identical Arabic forms.
 */
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;

const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

/** Names nobody should be able to claim. */
const RESERVED = new Set([
    'admin', 'administrator', 'root', 'support', 'help', 'system',
    'pizzaazez', 'azez', 'moderator', 'staff', 'owner', 'null', 'undefined',
]);

/**
 * @returns {{ ok: boolean, value?: string, message?: string }}
 *          `value` is the trimmed username as typed — case is preserved for
 *          display, while uniqueness is enforced case-insensitively.
 */
function validateUsername(raw) {
    const value = String(raw ?? '').trim();

    if (!value) return { ok: false, message: 'اسم المستخدم مطلوب' };
    if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
        return { ok: false, message: `اسم المستخدم يجب أن يكون بين ${MIN_LENGTH} و${MAX_LENGTH} حرفاً` };
    }
    if (!USERNAME_PATTERN.test(value)) {
        return {
            ok: false,
            message: 'اسم المستخدم يجب أن يبدأ بحرف إنجليزي ويحتوي على حروف وأرقام و _ . فقط',
        };
    }
    if (RESERVED.has(value.toLowerCase())) {
        return { ok: false, message: 'اسم المستخدم غير متاح' };
    }
    return { ok: true, value };
}

module.exports = { validateUsername, USERNAME_PATTERN, MIN_LENGTH, MAX_LENGTH, RESERVED };
