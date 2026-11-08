import { createHead, UnheadProvider } from '@unhead/react/client'
import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import store, { persistor } from '@/store'

import { StyledThemeProvider } from './StyledThemeProvider'

const head = createHead()

interface RootProvidersProps {
    children: React.ReactNode
}

/**
 * RootProviders centralizes all top-level providers.
 * Order matters:
 *  1. UnheadProvider — SEO head management (no store dependency)
 *  2. Redux Provider — store
 *  3. PersistGate — waits for rehydration before rendering
 *  4. StyledThemeProvider — provides SC theme + GlobalStyle
 */
export function RootProviders({ children }: RootProvidersProps) {
    return (
        <UnheadProvider head={head}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <StyledThemeProvider>
                        {children}
                    </StyledThemeProvider>
                </PersistGate>
            </Provider>
        </UnheadProvider>
    )
}
