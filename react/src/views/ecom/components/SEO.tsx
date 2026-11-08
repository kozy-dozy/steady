import { useHead } from '@unhead/react'
import { useLocation } from 'react-router-dom'

import { COMPANY_CONFIG } from '@/config/company.config'

const SITE_URL = COMPANY_CONFIG.domain

type SEOProps = {
    title: string
    description?: string
    image?: string
    canonicalPath?: string
    noindex?: boolean
}

export default function SEO({
    title,
    description,
    image,
    canonicalPath,
    noindex,
}: SEOProps) {
    const location = useLocation()

    const canonicalUrl = (() => {
        if (!SITE_URL) return undefined
        const path = canonicalPath ?? location.pathname
        return `${String(SITE_URL).replace(/\/$/, '')}${path}`
    })()

    // Default social card; relative paths are made absolute for crawlers.
    const rawImage = image ?? COMPANY_CONFIG.seo.ogImage
    const ogImage = rawImage?.startsWith('/') && SITE_URL ? `${String(SITE_URL).replace(/\/$/, '')}${rawImage}` : rawImage

    const isProd = import.meta.env.MODE === 'production'
    const shouldNoindex = noindex ?? !isProd

    useHead({
        title,
        meta: [
            description && { name: 'description', content: description },

            {
                name: 'robots',
                content: shouldNoindex ? 'noindex,nofollow' : 'index,follow',
            },

            // Open Graph
            canonicalUrl && { property: 'og:url', content: canonicalUrl },
            { property: 'og:title', content: title },
            description && { property: 'og:description', content: description },
            { property: 'og:type', content: 'website' },
            ogImage && { property: 'og:image', content: ogImage },

            // Twitter
            {
                name: 'twitter:card',
                content: ogImage ? 'summary_large_image' : 'summary',
            },
            { name: 'twitter:title', content: title },
            description && {
                name: 'twitter:description',
                content: description,
            },
            ogImage && { name: 'twitter:image', content: ogImage },
        ].filter(Boolean) as any,
        link: canonicalUrl ? [{ rel: 'canonical', href: canonicalUrl }] : [],
    })

    return null
}
