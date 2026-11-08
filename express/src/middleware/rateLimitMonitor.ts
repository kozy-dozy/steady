import * as Sentry from '@sentry/node'

import type { Request, Response, NextFunction } from 'express'

/**
 * Middleware to capture and monitor rate limit (429) responses
 * Sends rate limit events to Sentry for alerting and analytics
 */
export function rateLimitMonitor(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // Intercept the response to catch 429 status codes
    const originalSend = res.send

    res.send = function (data: any) {
        // Only capture 429 responses
        if (res.statusCode === 429) {
            const ip = req.ip || req.socket.remoteAddress || 'unknown'
            const endpoint = `${req.method} ${req.path}`
            const userId = (req as any).userId || 'anonymous'

            // Send to Sentry as a warning (not an error) with context
            Sentry.withScope((scope) => {
                scope.setTag('type', 'rate_limit')
                scope.setTag('endpoint', endpoint)
                scope.setTag('method', req.method)
                scope.setTag('status', '429')
                scope.setContext('rateLimit', {
                    limit: res.get('ratelimit-limit'),
                    remaining: res.get('ratelimit-remaining'),
                    reset: res.get('ratelimit-reset'),
                })
                scope.setExtra('ip', ip)
                scope.setExtra('userId', userId)
                scope.setExtra('path', req.path)
                scope.setExtra('userAgent', req.get('user-agent'))

                Sentry.captureMessage(
                    `Rate limit exceeded: ${endpoint}`,
                    'warning',
                )
            })
        }

        // Call original send
        return originalSend.call(this, data)
    }

    next()
}
