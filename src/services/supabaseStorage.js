// Supabase client for frontend (image uploads to Storage)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://utotcozlqmnverrugjkx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HSLL7fsrq4wOZVvxH2lT4Q_XFYKcemz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Upload a profile image to Supabase Storage.
 * If the user already has an image, removes the old one first.
 * @param {string} userId - user ID for file naming
 * @param {string} imageUri - local file URI from image picker
 * @param {string|null} previousImageUrl - existing image URL to delete
 * @returns {string} public URL of the uploaded image
 */
export async function uploadProfileImage(userId, imageUri, previousImageUrl = null) {
    // Delete previous image if exists
    if (previousImageUrl) {
        try {
            const oldPath = previousImageUrl.split('/profile-images/')[1];
            if (oldPath) {
                await supabase.storage.from('profile-images').remove([oldPath]);
            }
        } catch (err) {
            console.warn('Could not delete old image:', err);
        }
    }

    // Read file and upload
    const fileName = `${userId}_${Date.now()}.jpg`;

    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for Supabase upload
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
        });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}
