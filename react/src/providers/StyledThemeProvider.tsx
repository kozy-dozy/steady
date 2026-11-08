import { createTheme, GlobalStyle } from '@kozy-dozy/theme'
import React from 'react'
import { ThemeProvider } from 'styled-components'

import { steadyTokens } from '@/config/brand.tokens'

// Built once from the Steady tokens (config/brand.tokens.ts). Light only.
const theme = createTheme(steadyTokens)

interface StyledThemeProviderProps {
    children: React.ReactNode
}

/**
 * Provides the styled-components theme.
 * Renders GlobalStyle inside the provider so it always has theme access.
 */
export function StyledThemeProvider({ children }: StyledThemeProviderProps) {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            {children}
        </ThemeProvider>
    )
}
