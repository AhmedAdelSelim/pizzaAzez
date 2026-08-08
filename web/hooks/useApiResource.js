'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads a resource on mount and exposes a manual `reload` for refresh buttons
 * and post-mutation refetches.
 *
 * `fetcher` must be stable (wrap it in `useCallback`). Pass `enabled: false`
 * to hold off until a dependency such as the auth token is available.
 */
export function useApiResource(fetcher, { enabled = true, initialData = null, onError } = {}) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(enabled);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onErrorRef.current = onError;
    });

    // Kicked off in a microtask so nothing updates state synchronously when an
    // effect calls this.
    const run = useCallback(() => {
        if (!enabled) return Promise.resolve();
        return Promise.resolve()
            .then(fetcher)
            .then(setData)
            .catch((error) => onErrorRef.current?.(error))
            .finally(() => setLoading(false));
    }, [fetcher, enabled]);

    useEffect(() => {
        run();
    }, [run]);

    const reload = useCallback(() => {
        setLoading(true);
        return run();
    }, [run]);

    return { data, loading, reload, setData };
}
