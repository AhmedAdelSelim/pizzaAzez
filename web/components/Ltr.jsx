/**
 * An isolated left-to-right run inside the app's RTL layout.
 *
 * Latin/numeric content is fine on its own — digits and letters carry their own
 * direction. The trouble is *neutral* characters (# - / : + .) at the edge of
 * such a run: the bidi algorithm resolves them against the surrounding RTL
 * paragraph, so `#ORD-J25T` renders as `ORD-J25T#`.
 *
 * `<bdi>` isolates the run so neutrals resolve against LTR instead. Prefer this
 * over a bare `dir="ltr"` span for order numbers, phone numbers, coupon codes,
 * timers and any other embedded Latin text.
 */
export default function Ltr({ children, className }) {
    return (
        <bdi dir="ltr" className={className}>
            {children}
        </bdi>
    );
}
