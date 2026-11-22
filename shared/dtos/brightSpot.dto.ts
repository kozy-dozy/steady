/** Bright Spots: things that are going okay, shown beside the worry list as a counterweight. */

export const BRIGHT_SPOT_LIMITS = {
    textMaxLength: 240,
    /** Per user; the panel scrolls, this just keeps a runaway list bounded. */
    max: 500,
    /** Photos are resized in the browser first (long side, px). */
    imageMaxSide: 1400,
    /** Decoded bytes accepted by the server after resize. Fits the 1mb JSON body as base64. */
    imageMaxBytes: 700 * 1024,
} as const

export const BRIGHT_SPOT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type BrightSpotImageType = (typeof BRIGHT_SPOT_IMAGE_TYPES)[number]

/** Photo info on the list; the bytes load separately (GET /api/bright-spots/:id/image). */
export interface BrightSpotImageMeta {
    width: number
    height: number
    /** Changes when the photo is replaced; use it as a cache key. */
    updatedAt: string
}

/** Lists come back in the user's order (drag and drop on the Bright Spots page). */
export interface BrightSpotDto {
    id: string
    text: string
    /** null when there's no photo (photos are optional). */
    image: BrightSpotImageMeta | null
    createdAt: string
    updatedAt: string
}

export interface BrightSpotInput {
    text: string
}

/** PATCH /api/bright-spots/reorder: every id, in the order to show them. */
export interface BrightSpotReorderInput {
    ids: string[]
}

/** PUT /api/bright-spots/:id/image */
export interface BrightSpotImageInput {
    mime: BrightSpotImageType
    /** Base64 (no data: prefix). */
    data: string
    width: number
    height: number
}

/** GET /api/bright-spots/:id/image */
export interface BrightSpotImageResponse {
    mime: BrightSpotImageType
    data: string
}
