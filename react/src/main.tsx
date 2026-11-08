import { createTheme } from '@kozy-dozy/theme'
import { configureSpinnerIcon, configureToastPortal } from '@kozy-dozy/ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import { steadyTokens } from '@/config/brand.tokens'

import App from './App'
import AppErrorBoundary from './components/AppErrorBoundary'
import BrandSpinnerIcon from './components/BrandSpinnerIcon'
import { RootProviders } from './providers/RootProviders'
import store from './store'
import { initGA } from './utils/analytics/googleAnalytics'
import { initSentry } from './utils/sentry'

import './index.css'

// --- Shared-package bootstrap (preserves prior behaviour) ---
// 1. Spinner uses the brand spinner icon everywhere.
// 2. Toasts render in a detached root, so re-establish store + themed context.
const platformTheme = createTheme(steadyTokens)
configureSpinnerIcon(<BrandSpinnerIcon />)
configureToastPortal((node) => (
    <Provider store={store}>
        <ThemeProvider theme={platformTheme}>
            {node}
        </ThemeProvider>
    </Provider>
))

initSentry()
initGA()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <AppErrorBoundary>
            <RootProviders>
                <App />
            </RootProviders>
        </AppErrorBoundary>
    </React.StrictMode>,
)
