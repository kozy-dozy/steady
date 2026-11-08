import type { BrandTokens, ColorScheme } from '@kozy-dozy/tokens'

/**
 * Steady: "Still water" (Option A, chosen 2026-11-08).
 * Lake teal CTA + warm sand accent on a misty blue-grey page.
 * Light only, no light/dark toggle (Jacob, 2026-11-08). @kozy-dozy/tokens v2 has one scheme.
 * Fonts: Outfit (display) + Atkinson Hyperlegible (body), Google Fonts.
 * AA checked: white on primary 6.9:1 · text on page 13.5:1 · muted on page 5.3:1 ·
 * text.primary on accentGold 9.1:1. Never put white text on accentGold.
 * Source of truth: designs/steady/brand.tokens.ts (theme row on the design canvas).
 */
const colors: ColorScheme = {
    primary: '#2C6170',
    primaryHover: '#224E5A',
    primaryLight: '#DCEAEE',
    primaryLightAlt: '#EAF2F4',
    secondary: '#5B6F94', // depression accent (slate blue)
    secondaryHover: '#4A5C7E',
    secondaryLight: '#E4E1F0',
    brandRed: '#8A2E1B',
    accentGold: '#E3C9A0',
    text: {
        primary: '#1C2B30',
        secondary: '#3E5157',
        inverse: '#FFFFFF',
        dark: '#1C2B30',
        muted: '#556A70',
        inverseMuted: 'rgba(255,255,255,0.80)',
        disabled: '#A2B0B4',
    },
    bg: {
        page: '#F3F6F7',
        card: '#FFFFFF',
        input: '#FFFFFF',
        hover: '#EAF2F4',
        muted: '#E6EDEF',
        overlay: 'rgba(28, 43, 48, 0.45)',
    },
    border: {
        default: '#D3DDE0',
        strong: '#BCCACE',
        dark: '#97A8AD',
    },
    status: {
        success: '#1E5E36',
        error: '#B42318',
        warning: '#6B4A12',
        info: '#2C6170',
        successBg: '#DDF0E4',
        errorBg: '#FBE9E4',
    },
}

export const steadyTokens: BrandTokens = {
    name: 'steady',
    colors,
    typography: {
        fontPrimary: "'Outfit', system-ui, -apple-system, sans-serif",
        fontSecondary: "'Atkinson Hyperlegible', system-ui, -apple-system, sans-serif",
    },
    radius: { sm: '8px', md: '10px', lg: '14px', xl: '20px', full: '9999px' },
    shadow: {
        sm: '0 1px 3px rgba(28,43,48,0.05)',
        md: '0 6px 18px rgba(28,43,48,0.07)',
        lg: '0 16px 40px rgba(28,43,48,0.10)',
    },
    // Pill, mixed case, flat: soft and unhurried.
    button: {
        radius: 'full',
        textTransform: 'none',
        letterSpacing: 'normal',
        lineHeight: '1.2',
        fontSizeLg: '17px',
        padding: { sm: '8px 16px', md: '12px 24px', lg: '15px 30px' },
        elevated: false,
        activeOpacity: 0.9,
    },
    spinner: { colorSlot: 'primary', size: 28, duration: '0.9s' },
}
