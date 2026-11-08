import * as Sentry from '@sentry/react'

import { INTEGRATIONS_CONFIG } from '@/config/integrations.config'

const DSN = INTEGRATIONS_CONFIG.sentry.dsn

export const isSentryEnabled = Boolean(DSN)

/**
 * Initialize frontend error + performance monitoring.
 * No-ops when VITE_SENTRY_DSN is not set, so local/dev runs stay quiet
 * unless a DSN is explicitly provided.
 */
export function initSentry() {
    if (!DSN) return

    Sentry.init({
        dsn: DSN,
        environment: import.meta.env.MODE,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        // Performance: sample 10% of transactions in prod, all in dev
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        // Session Replay: skip normal sessions, capture fully when an error fires
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        // Drop noise we can't act on (browser quirks, user network, extensions)
        ignoreErrors: [
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications.',
            'Non-Error promise rejection captured',
            'AbortError',
            /Failed to fetch/i,
            /NetworkError/i,
            /Load failed/i,
        ],
        denyUrls: [
            /^chrome-extension:\/\//i,
            /^moz-extension:\/\//i,
            /extensions\//i,
        ],
    })
}
