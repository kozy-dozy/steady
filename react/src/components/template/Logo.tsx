import styled from 'styled-components'

import { APP_NAME } from '@/constants/app.constant'

interface LogoProps {
    mode?: 'light' | 'dark'
    style?: React.CSSProperties
    logoWidth?: number | string
    /** Hide the wordmark (icon only). */
    markOnly?: boolean
}

/**
 * Placeholder logo: a still-water mark (teal circle, one sand ripple) + wordmark, drawn in code.
 */
const Wrap = styled.div<{ $width?: string | number; $dark: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : ($width ?? 'auto'))};
    color: ${({ theme, $dark }) => ($dark ? theme.colors.text.inverse : theme.colors.text.primary)};
`

const Word = styled.span`
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-weight: 700;
    font-size: 21px;
    line-height: 1;
`

export function LogoMark({ size = 34 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#2C6170" />
            <path d="M7 18c3-3 6-3 9 0s6 3 9 0" stroke="#E3C9A0" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
    )
}

export default function Logo({ style, logoWidth, mode = 'light', markOnly }: LogoProps) {
    return (
        <Wrap style={style} $width={logoWidth} $dark={mode === 'dark'} aria-label={APP_NAME}>
            <LogoMark />
            {!markOnly && <Word>{APP_NAME}</Word>}
        </Wrap>
    )
}
