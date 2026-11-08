import * as Sentry from '@sentry/react'

import type { ReactNode } from 'react'

function Fallback() {
    return (
        <div
            role="alert"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 24,
                textAlign: 'center',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <h1 style={{ margin: 0, fontSize: 24 }}>Something went wrong</h1>
            <p style={{ margin: 0, maxWidth: 420, opacity: 0.7 }}>
                Sorry — an unexpected error occurred. Please reload the page. If
                the problem keeps happening, try again in a few minutes.
            </p>
            <button
                type="button"
                style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid currentColor',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: 15,
                }}
                onClick={() => window.location.reload()}
            >
                Reload page
            </button>
        </div>
    )
}

/**
 * Catches render-time errors anywhere in the tree, shows a fallback UI,
 * and reports the error (with component stack) to Sentry when enabled.
 */
export default function AppErrorBoundary({
    children,
}: {
    children: ReactNode
}) {
    return (
        <Sentry.ErrorBoundary fallback={<Fallback />}>
            {children}
        </Sentry.ErrorBoundary>
    )
}
