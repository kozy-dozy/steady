import styled, { css } from 'styled-components'

/** Shared building blocks for the app screens (Still water theme, light only). */

export const Page = styled.div`
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md} 120px`};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};

    @media (min-width: 1024px) {
        padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing['2xl']} ${theme.spacing['3xl']}`};
    }
`

export const PageHead = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: ${({ theme }) => theme.spacing.md};
    flex-wrap: wrap;
`

export const Eyebrow = styled.span`
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.fontSize.sm};
`

export const Title = styled.h1`
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: clamp(1.7rem, 1.3rem + 1.2vw, 2.15rem);
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.15;
    color: ${({ theme }) => theme.colors.text.primary};
`

export const SectionTitle = styled.h2`
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: ${({ theme }) => theme.fontSize.xl};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
`

export const Muted = styled.span`
    color: ${({ theme }) => theme.colors.text.muted};
`

export const Card = styled.div`
    background: ${({ theme }) => theme.colors.bg.card};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    min-width: 0;
`

export const Row = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    flex-wrap: wrap;
    align-items: center;
`

export const Chip = styled.span<{ $tone?: 'plain' | 'anxiety' | 'depression' | 'active' | 'improving' | 'resolved' }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 26px;
    padding: 2px 11px;
    border-radius: ${({ theme }) => theme.radius.full};
    font-size: ${({ theme }) => theme.fontSize.sm};
    white-space: nowrap;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    color: ${({ theme }) => theme.colors.text.primary};
    background: transparent;

    ${({ $tone, theme }) => {
        switch ($tone) {
            case 'anxiety':
                return css`background: ${theme.colors.primaryLight}; border-color: ${theme.colors.primaryLight}; font-weight: 700;`
            case 'depression':
                return css`background: ${theme.colors.secondaryLight}; border-color: ${theme.colors.secondaryLight}; font-weight: 700;`
            case 'active':
                return css`background: ${theme.colors.status.errorBg}; border-color: ${theme.colors.status.errorBg}; color: ${theme.colors.brandRed}; font-weight: 700;`
            case 'improving':
                return css`background: #F6EBD5; border-color: #F6EBD5; color: ${theme.colors.status.warning}; font-weight: 700;`
            case 'resolved':
                return css`background: ${theme.colors.status.successBg}; border-color: ${theme.colors.status.successBg}; color: ${theme.colors.status.success}; font-weight: 700;`
            default:
                return ''
        }
    }}
`

/** Pill button used for choices (categories, control, filters). */
export const PillButton = styled.button<{ $on?: boolean }>`
    min-height: 44px;
    padding: 0 16px;
    border-radius: ${({ theme }) => theme.radius.full};
    border: 1px solid ${({ theme, $on }) => ($on ? theme.colors.primary : theme.colors.border.default)};
    background: ${({ theme, $on }) => ($on ? theme.colors.primary : theme.colors.bg.card)};
    color: ${({ theme, $on }) => ($on ? theme.colors.text.inverse : theme.colors.text.primary)};
    font: inherit;
    font-size: ${({ theme }) => theme.fontSize.sm};
    font-weight: ${({ $on }) => ($on ? 700 : 400)};
    cursor: pointer;
    transition: background ${({ theme }) => theme.transition.fast};

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`

/** Segmented control track (Anxiety / Depression / Both). */
export const Segmented = styled.div`
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme }) => theme.colors.bg.muted};
`

export const Segment = styled.button<{ $on?: boolean }>`
    flex: 1;
    min-height: 40px;
    padding: 0 14px;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme, $on }) => ($on ? theme.colors.primary : 'transparent')};
    color: ${({ theme, $on }) => ($on ? theme.colors.text.inverse : theme.colors.text.primary)};
    font: inherit;
    font-size: ${({ theme }) => theme.fontSize.sm};
    font-weight: ${({ $on }) => ($on ? 700 : 400)};
    cursor: pointer;
    white-space: nowrap;

    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`

export const FieldLabel = styled.span`
    font-size: ${({ theme }) => theme.fontSize.sm};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
`

export const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
`

export const NativeSelect = styled.select`
    min-height: 44px;
    padding: 0 14px;
    border-radius: ${({ theme }) => theme.radius.full};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.card};
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;
    font-size: ${({ theme }) => theme.fontSize.sm};
`

export const TextInput = styled.input`
    width: 100%;
    min-height: 46px;
    padding: 10px 14px;
    border-radius: ${({ theme }) => theme.radius.md};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.input};
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 1px;
    }
`

export const TextArea = styled.textarea`
    width: 100%;
    min-height: 84px;
    padding: 10px 14px;
    border-radius: ${({ theme }) => theme.radius.md};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.input};
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;
    resize: vertical;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 1px;
    }
`

export const ErrorText = styled.span`
    color: ${({ theme }) => theme.colors.status.error};
    font-size: ${({ theme }) => theme.fontSize.sm};
`

export const Range = styled.input.attrs({ type: 'range' })`
    width: 100%;
    height: 32px;
    accent-color: ${({ theme }) => theme.colors.primary};
`
