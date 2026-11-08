import express, { type Request, type Response } from 'express'

import asyncHandler from '../../../src/utils/asyncHandler'

type Overall =
    | 'operational'
    | 'degraded'
    | 'partial_outage'
    | 'major_outage'
    | 'maintenance'
    | 'unknown'

type Incident = {
    title: string
    status: string
    startedAt?: string
    url?: string
}

export type ProviderStatus = {
    provider: string
    overall: Overall
    updatedAt?: string
    url: string
    incidents: Incident[]
    components?: { name: string; status: string }[]
}

const router = express.Router()

/**
 * Simple in-memory cache
 */
const CACHE_TTL_MS = 120_000 // 2 minutes
let cache: { at: number; data: ProviderStatus[] } | null = null

const normalizeStatuspageIndicator = (indicator?: string): Overall => {
    switch (indicator) {
        case 'none':
            return 'operational'
        case 'minor':
            return 'degraded'
        case 'major':
            return 'major_outage'
        case 'critical':
            return 'major_outage'
        default:
            return 'unknown'
    }
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        headers: {
            accept: 'application/json',
        },
    })
    if (!res.ok) {
        throw new Error(
            `Fetch failed ${res.status} ${res.statusText} for ${url}`,
        )
    }
    return (await res.json()) as T
}

/**
 * Statuspage (Atlassian) provider using /api/v2/summary.json
 * Example: https://status.mongodb.com/api/v2/summary.json
 */
async function getStatuspageSummary(
    providerName: string,
    baseStatusUrl: string
) {
    type StatuspageSummary = {
        page?: { updated_at?: string }
        status?: { indicator?: string; description?: string }
        incidents?: {
            name: string
            status: string
            created_at?: string
            shortlink?: string
        }[]
        components?: { name: string; status: string }[]
    }

    const summaryUrl = `${baseStatusUrl.replace(/\/$/, '')}/api/v2/summary.json`
    const json = await fetchJson<StatuspageSummary>(summaryUrl)

    const overall = normalizeStatuspageIndicator(json.status?.indicator)
    const incidents =
        (json.incidents ?? []).map((i) => ({
            title: i.name,
            status: i.status,
            startedAt: i.created_at,
            url: i.shortlink,
        })) ?? []

    const components =
        (json.components ?? []).map((c) => ({
            name: c.name,
            status: c.status,
        })) ?? []

    return {
        provider: providerName,
        overall,
        updatedAt: json.page?.updated_at,
        url: baseStatusUrl,
        incidents,
        components,
    } satisfies ProviderStatus
}

/**
 * Slack status API (JSON)
 * Docs-ish: status.slack.com exposes API endpoints
 */
async function getSlackStatus() {
    type SlackCurrent = {
        status: string // "ok", "active", etc
        date_created?: string
        date_updated?: string
        active_incidents?: {
            title: string
            status: string
            date_created?: string
            url?: string
        }[]
    }

    const url = 'https://status.slack.com/api/v2.0.0/current'
    const json = await fetchJson<SlackCurrent>(url)

    const overall: Overall =
        json.status === 'ok'
            ? 'operational'
            : json.status === 'active'
            ? 'degraded'
            : 'unknown'

    const incidents =
        (json.active_incidents ?? []).map((i) => ({
            title: i.title,
            status: i.status,
            startedAt: i.date_created,
            url: i.url,
        })) ?? []

    return {
        provider: 'Slack',
        overall,
        updatedAt: json.date_updated ?? json.date_created,
        url: 'https://status.slack.com',
        incidents,
    } satisfies ProviderStatus
}

const PROVIDERS: Array<() => Promise<ProviderStatus>> = [
    () => getStatuspageSummary('MongoDB Atlas', 'https://status.mongodb.com'),
    () => getStatuspageSummary('Vercel', 'https://www.vercel-status.com'), // fallback if you use statuspage domain
    () =>
        getStatuspageSummary('Cloudflare', 'https://www.cloudflarestatus.com'),
    () => getStatuspageSummary('Stripe', 'https://status.stripe.com'),
    () => getStatuspageSummary('SendGrid', 'https://status.sendgrid.com'),
    () => getStatuspageSummary('Sentry', 'https://status.sentry.io'),
    () => getSlackStatus(),
]

/**
 * GET /api/status/status
 * ?refresh=1 bypasses cache
 */

router.get(
    '/status',
    asyncHandler(async (req: Request, res: Response) => {
        try {
            const refresh = req.query.refresh === '1'

            if (!refresh && cache && Date.now() - cache.at < CACHE_TTL_MS) {
                res.json({
                    data: cache.data,
                    cached: true,
                    cachedAt: cache.at,
                })
                return
            }

            const settled = await Promise.allSettled(
                PROVIDERS.map((fn) => fn()),
            )

            const providerFallbackNames = [
                'MongoDB Atlas',
                'Vercel',
                'Cloudflare',
                'Stripe',
                'SendGrid',
                'Sentry',
                'Slack',
            ]

            const data: ProviderStatus[] = settled.map((s, idx) => {
                if (s.status === 'fulfilled') return s.value

                return {
                    provider:
                        providerFallbackNames[idx] ?? `Provider ${idx + 1}`,
                    overall: 'unknown',
                    url: '#',
                    incidents: [
                        {
                            title: 'Failed to fetch status',
                            status: String(s.reason ?? 'error'),
                        },
                    ],
                }
            })

            cache = { at: Date.now(), data }

            res.json({ data, cached: false, cachedAt: cache.at })
            return
        } catch (e: any) {
            res.status(500).json({
                error: e?.message ?? 'Failed to load third party status',
            })
            return
        }
    }),
)

export default router
