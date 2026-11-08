import { LuMessageSquare, LuPhone } from 'react-icons/lu'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'

const { help } = CONTENT_CONFIG

const Box = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radius.lg};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.card};
`

const Head = styled.strong`
    font-size: ${({ theme }) => theme.fontSize.md};
`

const Body = styled.span`
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.muted};
`

const Actions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.xs};
`

export const HelpLink = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px;
    border-radius: ${({ theme }) => theme.radius.full};
    border: 1.5px solid ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
    font-size: ${({ theme }) => theme.fontSize.sm};
    text-decoration: none;
    white-space: nowrap;

    &:hover {
        background: ${({ theme }) => theme.colors.primaryLight};
    }
`

/** Full help card: sidebar and sign-in. */
export default function HelpCard({ showEmergency = false }: { showEmergency?: boolean }) {
    return (
        <Box>
            <Head>{help.title}</Head>
            <Body>{help.body}</Body>
            <Actions>
                <HelpLink href={help.callHref}>
                    <LuPhone size={16} aria-hidden="true" />
                    {help.callLabel}
                </HelpLink>
                <HelpLink href={help.textHref}>
                    <LuMessageSquare size={16} aria-hidden="true" />
                    {help.textLabel}
                </HelpLink>
            </Actions>
            {showEmergency && <Body>{help.emergency}</Body>}
        </Box>
    )
}
