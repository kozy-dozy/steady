/**
 * Site photography (sign-in panel, social card). App screens use no photos.
 * Paths and sizes match designs/steady/image-manifest.md exactly.
 * Until the files exist, the sign-in panel shows its primaryLight background.
 */

export interface SiteImage {
    src: string
    alt: string
    /** Intrinsic size, so the browser reserves space before the image loads. */
    width: number
    height: number
}

const img = (name: string, alt: string, width: number, height: number): SiteImage => ({
    src: `/images/placeholder/site/${name}.jpg`,
    alt,
    width,
    height,
})

export const SITE_IMAGES = {
    auth: {
        login: img('login', 'A still lake at dawn with light mist over the water', 1600, 1200),
    },
    /** Default Open Graph / social share image */
    og: img('og-default', 'Steady', 1200, 630),
} as const
