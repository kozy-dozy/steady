/**
 * Steady: app identity. Placeholder name and domain for now (rename any time).
 */
export const COMPANY_CONFIG = {
    name: 'Steady',
    tagline: 'Your private place to set worries down.',

    timezone: 'America/New_York',

    domain: 'https://example.com',

    seo: {
        defaultTitle: 'Steady',
        defaultDescription: 'A private place to set worries down, sort them and watch them change.',
        ogImage: '/images/placeholder/site/og-default.jpg',
    },
} as const
