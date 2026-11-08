import { INTEGRATIONS_CONFIG } from '@/config/integrations.config'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import store, { signOutSuccess, setUser } from '@/store'

type FetchArgs<U> = {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    data?: U
    params?: Record<string, any>
    headers?: Record<string, string>
}

type ApiError = {
    status: number
    error?: string
    message?: string
}

const API_BASE_URL = INTEGRATIONS_CONFIG.api.baseUrl

function buildUrl(path: string, params?: Record<string, any>) {
    // Ensure single slash between base + path
    const base = API_BASE_URL.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    const url = new URL(base + normalizedPath)

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v === undefined || v === null || v === '') return
            url.searchParams.set(k, String(v))
        })
    }

    return url.toString()
}

async function parseJsonSafe(res: Response) {
    const text = await res.text()
    if (!text) return null
    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

let refreshPromise: Promise<void> | null = null

async function refreshToken(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const res = await fetch(buildUrl('/auth/refresh'), {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) {
                const body = (await parseJsonSafe(res)) as any
                const err: ApiError = {
                    status: res.status,
                    error: body?.error || body?.message || 'Refresh failed',
                }
                throw err
            }
        })().finally(() => {
            refreshPromise = null
        })
    }

    return refreshPromise
}

function hardSignOut() {
    // Clears redux auth + user
    store.dispatch(signOutSuccess())
    store.dispatch(
        setUser({
            id: '',
            avatar: '',
            firstName: '',
            lastName: '',
            email: '',
            authority: [],
        }),
    )

    // If you're persisting redux, this ensures stale "admin" doesn't hang around.
    localStorage.removeItem(PERSIST_STORE_NAME)
}

async function request<T, U>(args: FetchArgs<U>, retry = false): Promise<T> {
    const res = await fetch(buildUrl(args.url, args.params), {
        method: args.method,
        credentials: 'include', // ✅ sends httpOnly cookies token/refreshToken
        headers: {
            'Content-Type': 'application/json',
            ...(args.headers || {}),
        },
        body: args.data ? JSON.stringify(args.data) : undefined,
    })

    const body = await parseJsonSafe(res)

    if (res.ok) return body as T

    const err: ApiError = {
        status: res.status,
        error:
            (body as any)?.error ||
            (body as any)?.message ||
            String(body || ''),
        message: (body as any)?.message,
    }

    // If access token expired/invalid -> attempt refresh once, retry request
    if (err.status === 401 && !retry && args.url !== '/auth/refresh') {
        const state = store.getState()
        const wasSignedIn = !!state.auth?.session?.signedIn

        // If user is NOT signed in, 401 is expected (e.g. /members/me on load)
        // Do NOT refresh or hard sign out (prevents infinite loops).
        if (!wasSignedIn) throw err

        try {
            await refreshToken()
            return request<T, U>(args, true)
        } catch {
            hardSignOut()
            throw err
        }
    }

    // ✅ Only hard sign out on 401 if we thought we were signed in
    if (err.status === 401) {
        const state = store.getState()
        const wasSignedIn = !!state.auth?.session?.signedIn
        if (wasSignedIn) hardSignOut()
    }

    throw err
}

const ApiService = {
    fetchData: <T = unknown, U = Record<string, unknown>>(args: FetchArgs<U>) =>
        request<T, U>(args),
}

export default ApiService
