/**
 * The brand mark, drawn rather than photographed.
 *
 * It replaces /images/logo.png, which was a JPEG carrying a `.png` name — no
 * alpha channel, so it sat on the dark theme as a hard black square, and the
 * "scan lines" across it were compression artefacts on the dark pixels.
 *
 * As SVG it is transparent, sharp at any size, a couple of kB instead of 60, and
 * picks up the theme tokens — so a palette change carries through instead of
 * needing the asset re-exported.
 *
 * All motion is CSS, so nothing here runs on a timer, and
 * `prefers-reduced-motion` in globals.css stills the lot.
 */
import { useId } from 'react';

export default function Logo({
    size = 132,
    wordmark = true,
    tagline = null,
    animated = true,
    className = '',
}) {
    /*
     * `id`s inside <defs> are document-global, so two Logos on one page would
     * otherwise fight over the same gradients.
     *
     * useId rather than a counter: a module-level counter keeps incrementing on
     * the server across requests while the client starts from zero, so the two
     * render different ids and hydration reports a mismatched attribute. useId
     * is stable across both. The colons it contains are legal in an id but
     * awkward inside url(#…), so they come out.
     */
    const uid = `az-logo-${useId().replace(/:/g, '')}`;
    const g = (name) => `${uid}-${name}`;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 120 120"
                role="img"
                aria-label="بيتزا عزيز"
                className={animated ? 'animate-float' : undefined}
            >
                <defs>
                    <radialGradient id={g('glow')}>
                        <stop offset="0%" stopColor="#F4A442" stopOpacity="0.55" />
                        <stop offset="55%" stopColor="#E85D2C" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#E85D2C" stopOpacity="0" />
                    </radialGradient>

                    {/* Cheese: pale at the tip, deepening toward the crust, so the
                        slice reads as lit from above. */}
                    <linearGradient id={g('cheese')} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFE1A8" />
                        <stop offset="55%" stopColor="#FFC65C" />
                        <stop offset="100%" stopColor="#F4A442" />
                    </linearGradient>

                    <linearGradient id={g('crust')} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8A96B" />
                        <stop offset="100%" stopColor="#B9743A" />
                    </linearGradient>

                    <linearGradient id={g('pepperoni')} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF6B4A" />
                        <stop offset="100%" stopColor="#C4351E" />
                    </linearGradient>

                    {/* Diagonal highlight across the slice — the "glazed" read. */}
                    <linearGradient id={g('sheen')} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
                        <stop offset="45%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>

                    {/* Clips the sheen to the slice so it cannot spill over the edge. */}
                    <clipPath id={g('clip')}>
                        <path d="M60 18 L26 84 Q60 100 94 84 Z" />
                    </clipPath>
                </defs>

                <circle cx="60" cy="58" r="52" fill={`url(#${g('glow')})`} />

                {/* Steam. Behind the slice, so the wisps emerge from under the tip. */}
                <g
                    stroke="#FFE1A8"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                >
                    {[
                        { d: 'M48 26 C44 19 52 15 48 8', delay: '0s' },
                        { d: 'M60 22 C56 14 64 10 60 3', delay: '-1.1s' },
                        { d: 'M72 26 C68 19 76 15 72 8', delay: '-2.2s' },
                    ].map((wisp, i) => (
                        <path
                            key={i}
                            d={wisp.d}
                            className={animated ? 'animate-steam' : undefined}
                            style={animated ? { animationDelay: wisp.delay } : undefined}
                        />
                    ))}
                </g>

                {/* Crust: a thick round-capped stroke along the slice's bottom edge. */}
                <path
                    d="M26 84 Q60 100 94 84"
                    stroke={`url(#${g('crust')})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                />

                <path d="M60 18 L26 84 Q60 100 94 84 Z" fill={`url(#${g('cheese')})`} />

                <g fill={`url(#${g('pepperoni')})`}>
                    <circle cx="59" cy="43" r="6" />
                    <circle cx="45" cy="63" r="5.4" />
                    <circle cx="74" cy="64" r="5.4" />
                    <circle cx="60" cy="77" r="4.4" />
                </g>

                {/* Basil, for the green note against all the warm tones. */}
                <g fill="#4E9F3D" opacity="0.9">
                    <ellipse cx="51" cy="53" rx="3.4" ry="2.1" transform="rotate(-28 51 53)" />
                    <ellipse cx="69" cy="51" rx="3" ry="1.9" transform="rotate(24 69 51)" />
                </g>

                <g clipPath={`url(#${g('clip')})`}>
                    <path d="M60 18 L26 84 Q60 100 94 84 Z" fill={`url(#${g('sheen')})`} />
                </g>
            </svg>

            {wordmark && (
                <div className="mt-1 flex flex-col items-center">
                    {/* Latin, letter-spaced, gradient-filled. The Arabic name is on
                        the svg's aria-label, so this is decorative to a screen
                        reader rather than read out twice. */}
                    <span
                        aria-hidden="true"
                        className="bg-gradient-to-l from-secondary via-star to-primary bg-clip-text text-2xl font-extrabold uppercase tracking-[0.22em] text-transparent"
                        style={{ WebkitTextFillColor: 'transparent' }}
                    >
                        Pizza Aziz
                    </span>
                    <span
                        aria-hidden="true"
                        className="mt-0.5 h-px w-24 bg-gradient-to-l from-transparent via-primary to-transparent"
                    />
                    {tagline && (
                        <span className="mt-1.5 text-xs text-text-secondary">{tagline}</span>
                    )}
                </div>
            )}
        </div>
    );
}
