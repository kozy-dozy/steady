/** Bright Spots: things that are going okay, shown beside the worry list as a counterweight. */

export const BRIGHT_SPOT_LIMITS = {
    textMaxLength: 240,
    /** Per user; the panel scrolls, this just keeps a runaway list bounded. */
    max: 500,
} as const

export interface BrightSpotDto {
    id: string
    text: string
    createdAt: string
    updatedAt: string
}

export interface BrightSpotInput {
    text: string
}
