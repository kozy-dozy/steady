import ReactGA from 'react-ga4'

import { INTEGRATIONS_CONFIG } from '@/config/integrations.config'

const GA_ID = INTEGRATIONS_CONFIG.google.analyticsId

export const isGAEnabled = Boolean(GA_ID)

export function initGA() {
    if (!GA_ID) return
    ReactGA.initialize(GA_ID)
}

/** Call on route changes */
export function trackPageView(path: string) {
    if (!GA_ID) return
    ReactGA.send({ hitType: 'pageview', page: path })
}

/** Optional */
export function trackEvent(action: string, params?: Record<string, any>) {
    if (!GA_ID) return
    ReactGA.event(action, params)
}
