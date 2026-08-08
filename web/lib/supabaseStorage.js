// Supabase client for the frontend (image uploads to Storage)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://utotcozlqmnverrugjkx.supabase.co';
const SUPABASE_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_HSLL7fsrq4wOZVvxH2lT4Q_XFYKcemz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET = 'profile-images';

/**
 * Upload a profile image to Supabase Storage.
 * If the user already has an image, removes the old one first.
 * @param {string} userId - user ID for file naming
 * @param {File|Blob} file - file chosen in the browser
 * @param {string|null} previousImageUrl - existing image URL to delete
 * @returns {Promise<string>} public URL of the uploaded image
 */
export async function uploadProfileImage(userId, file, previousImageUrl = null) {
    if (previousImageUrl) {
        try {
            const oldPath = previousImageUrl.split(`/${BUCKET}/`)[1];
            if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
        } catch (err) {
            console.warn('Could not delete old image:', err);
        }
    }

    const fileName = `${userId}_${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return urlData.publicUrl;
}

/**
 * Upload a story image to Supabase Storage.
 * @param {string} userId - user ID for file naming
 * @param {File|Blob} file - file chosen in the browser
 * @returns {Promise<string>} public URL of the uploaded image
 */
export async function uploadStoryImage(userId, file) {
    const path = `stories/${userId}_${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
}
