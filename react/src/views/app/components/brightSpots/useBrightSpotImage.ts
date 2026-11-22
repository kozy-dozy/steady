import { useEffect, useState } from 'react'

import { apiGetBrightSpotImage } from '@/services/shared/BrightSpotService'

import type { BrightSpotDto } from '@shared/dtos'

/**
 * In-memory only (never localStorage): one load per photo per visit, shared by the panel and the
 * page. Keyed by id + updatedAt so a replaced photo loads fresh.
 */
const cache = new Map<string, Promise<string>>()

const keyOf = (spot: BrightSpotDto) => (spot.image ? `${spot.id}:${spot.image.updatedAt}` : '')

/** Drop a photo from the cache (after it is removed or replaced). */
export function forgetBrightSpotImage(id: string) {
    for (const key of cache.keys()) if (key.startsWith(`${id}:`)) cache.delete(key)
}

/** Seed the cache right after an upload so the new photo shows without another request. */
export function rememberBrightSpotImage(spot: BrightSpotDto, dataUrl: string) {
    forgetBrightSpotImage(spot.id)
    if (spot.image) cache.set(keyOf(spot), Promise.resolve(dataUrl))
}

/** data: URL for the spot's photo, or null while loading / when there is none. */
export default function useBrightSpotImage(spot: BrightSpotDto, enabled = true) {
    const key = keyOf(spot)
    const [src, setSrc] = useState<string | null>(null)

    useEffect(() => {
        if (!key || !enabled) {
            setSrc(null)
            return
        }
        let live = true
        if (!cache.has(key)) {
            const load = apiGetBrightSpotImage(spot.id).then((r) => `data:${r.mime};base64,${r.data}`)
            load.catch(() => cache.delete(key))
            cache.set(key, load)
        }
        cache
            .get(key)!
            .then((url) => live && setSrc(url))
            .catch(() => live && setSrc(null))
        return () => {
            live = false
        }
    }, [key, enabled, spot.id])

    return src
}
