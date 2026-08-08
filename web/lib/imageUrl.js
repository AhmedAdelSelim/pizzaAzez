/**
 * Normalizes Cloudinary delivery URLs.
 *
 * Menu images were uploaded with two different histories:
 *
 *  - 16 rows carry a baked-in `r_max,bo_5px_solid_red` transform, which renders
 *    the photo as a circle with a red ring on a dark square. Dropped into a
 *    rectangular card that reads as red arcs and dead corners.
 *  - The remaining rows carry no transform at all, so the original
 *    multi-megabyte upload is sent to the browser untouched.
 *
 * Rewriting the transform segment at render time fixes both without migrating
 * the stored URLs (which the mobile app also reads).
 */

const CLOUDINARY_UPLOAD = '/image/upload/';

/** A path segment is a transform if it looks like `k_v,k_v` — versions are `v123…`. */
const isTransformSegment = (segment) =>
    /^[a-z]{1,3}_[^/]+/.test(segment) && !/^v\d+$/.test(segment);

/**
 * @param {string} url      stored image URL
 * @param {object} options
 * @param {number} options.width   target width in CSS px (doubled for retina)
 * @param {string} [options.ratio] e.g. '1:1', '4:3'; omit to keep the source ratio
 */
export function foodImage(url, { width = 400, ratio } = {}) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD)) return url;

    const [prefix, rest] = url.split(CLOUDINARY_UPLOAD);
    if (!rest) return url;

    // Drop whatever transform is already there so the red ring can't survive.
    const parts = rest.split('/');
    if (isTransformSegment(parts[0])) parts.shift();

    const transform = [
        `w_${Math.round(width * 2)}`, // 2x for high-density screens
        'c_fill',
        ratio ? `ar_${ratio}` : null,
        'g_auto', // keep the food centred when cropping
        'f_auto', // webp/avif where supported
        'q_auto',
    ]
        .filter(Boolean)
        .join(',');

    return `${prefix}${CLOUDINARY_UPLOAD}${transform}/${parts.join('/')}`;
}
