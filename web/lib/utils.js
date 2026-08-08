/**
 * Normalizes Arabic text for more flexible searching.
 * Handles common variations like Alef types, Teh Marbuta, and Yaa.
 */
export const normalizeArabic = (text) => {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        // Remove accents (Tashkeel)
        .replace(/[ً-ْ]/g, '')
        // Normalize Alef
        .replace(/[أإآ]/g, 'ا')
        // Normalize Teh Marbuta
        .replace(/ة/g, 'ه')
        // Normalize Yaa
        .replace(/ى/g, 'ي')
        .trim();
};

/** Searches a list of items based on a query string and target fields. */
export const searchFilter = (items, query, fields = ['name', 'description']) => {
    if (!query) return items;
    const normalizedQuery = normalizeArabic(query);

    return items.filter(item =>
        fields.some(field => {
            const value = item[field];
            if (!value) return false;
            return normalizeArabic(String(value)).includes(normalizedQuery);
        })
    );
};

/** Fallback emoji per category, matching the RN card components. */
const CATEGORY_EMOJI = {
    1: '🧀', 2: '🍗', 3: '🥩', 4: '🌯', 5: '🔥',
    6: '🍕', 7: '🥧', 8: '🍫', 9: '🥟', 10: '🍟',
};

export function itemEmoji(item) {
    return (
        item?.categoryIcon ||
        CATEGORY_EMOJI[item?.category_id ?? item?.categoryId] ||
        '🍕'
    );
}

/** Joins conditional class names. */
export function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

/** Egyptian-pound formatting used across the UI. */
export function egp(value) {
    return `${Math.round(Number(value) || 0)} ج.م`;
}

/** Earliest date a birthday picker will accept. */
export const MIN_BIRTHDAY = '1900-01-01';

/**
 * Today as YYYY-MM-DD in Africa/Cairo, for capping a birthday picker.
 *
 * Local rather than UTC so the cap doesn't read as "yesterday" for a couple of
 * hours each night. Returns a stable string, so it is safe as a
 * `useClientSnapshot` getter.
 */
export function todayISO() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

/**
 * "قصة" / "قصص" agreeing with the count.
 *
 * Arabic counts 3–10 take the plural; 1, 2 and 11+ take the singular.
 */
export function storyCount(n) {
    const count = Number(n) || 0;
    return `${count} ${count >= 3 && count <= 10 ? 'قصص' : 'قصة'}`;
}
