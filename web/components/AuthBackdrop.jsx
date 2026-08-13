/**
 * Animated backdrop for the login and register screens.
 *
 * Two layers: a slow wash of blurred brand-coloured blobs, and a few
 * ingredients drifting upward past the card. Deliberately behind everything and
 * inert — `aria-hidden` plus `pointer-events-none`, so it never reaches the
 * accessibility tree or intercepts a tap on a field.
 *
 * Not a client component: it renders the same markup every time with no state
 * or effects, so it can stay on the server and ship no JavaScript. The motion is
 * pure CSS (see globals.css) and stops under `prefers-reduced-motion`.
 */

/** Blurred colour blobs. Positions are deliberately off-balance. */
const BLOBS = [
    { className: 'right-[-18%] top-[-12%] size-[26rem] bg-primary/25', delay: '0s' },
    { className: 'left-[-22%] top-[28%] size-[30rem] bg-secondary/20', delay: '-6s' },
    { className: 'bottom-[-20%] right-[10%] size-[24rem] bg-accent/15', delay: '-12s' },
];

/**
 * Drifting ingredients. Each gets its own horizontal travel, spin and duration
 * so the group never falls into lockstep — the giveaway that betrays a loop.
 */
const INGREDIENTS = [
    { glyph: '🍕', left: '8%', size: 'text-3xl', time: '17s', delay: '0s', x: '5vw', spin: '160deg' },
    { glyph: '🧀', left: '24%', size: 'text-2xl', time: '22s', delay: '-7s', x: '-4vw', spin: '-140deg' },
    { glyph: '🌿', left: '46%', size: 'text-xl', time: '19s', delay: '-13s', x: '6vw', spin: '200deg' },
    { glyph: '🍅', left: '68%', size: 'text-2xl', time: '24s', delay: '-4s', x: '-6vw', spin: '-180deg' },
    { glyph: '🍕', left: '86%', size: 'text-3xl', time: '20s', delay: '-16s', x: '3vw', spin: '120deg' },
];

export default function AuthBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
            {BLOBS.map((blob, i) => (
                <span
                    key={i}
                    // blur-3xl is what turns these from circles into a colour wash.
                    className={`animate-blob absolute rounded-full blur-3xl ${blob.className}`}
                    style={{ animationDelay: blob.delay }}
                />
            ))}

            {INGREDIENTS.map((item, i) => (
                <span
                    key={i}
                    className={`animate-drift absolute bottom-0 select-none ${item.size}`}
                    style={{
                        left: item.left,
                        animationDelay: item.delay,
                        '--drift-time': item.time,
                        '--drift-x': item.x,
                        '--drift-spin': item.spin,
                    }}
                >
                    {item.glyph}
                </span>
            ))}
        </div>
    );
}
