/**
 * Email configuration and templates
 * Centralized email settings and template identifiers
 */

import { COMPANY_CONFIG } from './company.config'

export const EMAIL_CONFIG = {
    /**
     * Sender email address
     */
    fromEmail: COMPANY_CONFIG.contact.email,

    /**
     * Sender name displayed in emails
     */
    fromName: COMPANY_CONFIG.name,

    /**
     * Email template identifiers (from your email service)
     * Update these to match your email provider's template IDs
     */
    templates: {
        passwordReset: 'password_reset',
        emailVerification: 'email_verification',
        accountCreated: 'account_created',
    },

    /**
     * Default email subject line fallback
     */
    defaultSubject: `Update from ${COMPANY_CONFIG.name}`,
} as const

export type EmailConfig = typeof EMAIL_CONFIG
