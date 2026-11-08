/**
 * App identity for the Express backend (emails). Placeholder details for now.
 */
export const COMPANY_CONFIG = {
    name: 'Steady',

    contact: {
        email: 'hello@example.com',
    },

    timezone: 'America/New_York',
} as const

export type CompanyConfig = typeof COMPANY_CONFIG
