/**
 * Normalizes Arabic text for more flexible searching.
 * Handles common variations like Alef types, Teh Marbuta, and Yaa.
 */
export const normalizeArabic = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        // Remove accents (Tashkeel)
        .replace(/[\u064B-\u0652]/g, '')
        // Normalize Alef
        .replace(/[أإآ]/g, 'ا')
        // Normalize Teh Marbuta
        .replace(/ة/g, 'ه')
        // Normalize Yaa
        .replace(/ى/g, 'ي')
        // General cleanup
        .trim();
};

/**
 * Searches a list of items based on a query string and target fields.
 */
export const searchFilter = (items, query, fields = ['name', 'description']) => {
    if (!query) return items;
    const normalizedQuery = normalizeArabic(query);
    
    return items.filter(item => {
        return fields.some(field => {
            const fieldValue = item[field];
            if (!fieldValue) return false;
            return normalizeArabic(String(fieldValue)).includes(normalizedQuery);
        });
    });
};
