import styled from 'styled-components'

import type { ReactNode } from 'react'

const Box = styled.div`
    padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing.md}`};
    text-align: center;
    color: ${({ theme }) => theme.colors.text.muted};
    border: 1px dashed ${({ theme }) => theme.colors.border.strong};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: ${({ theme }) => theme.colors.bg.card};
`

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
    return <Box role="status">{label}</Box>
}

export function EmptyState({ children }: { children: ReactNode }) {
    return <Box>{children}</Box>
}

export function ErrorState({ children }: { children?: ReactNode }) {
    return (
        <Box role="alert">
            {children ?? 'Something went wrong loading this. Please refresh, or call us.'}
        </Box>
    )
}
