import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { COMPANY_CONFIG } from '@/config/company.config'
import SEO from '@/views/ecom/components/SEO'

const Wrap = styled.section`
    max-width: 640px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing['3xl']}
        ${({ theme }) => theme.spacing.lg};
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.md};
    text-align: center;
`

const Code = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.sm};
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.primary};
`

const Title = styled.h1`
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: clamp(1.75rem, 1.2rem + 2.5vw, 2.75rem);
    line-height: 1.15;
    color: ${({ theme }) => theme.colors.text.primary};
`

const Body = styled.p`
    margin: 0;
    max-width: 48ch;
    font-size: ${({ theme }) => theme.fontSize.md};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.secondary};
`

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.sm};
`

const action = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 22px;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

    &:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
    }
`

const PrimaryAction = styled(Link)`
    ${action}
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 2px solid ${({ theme }) => theme.colors.primary};

    &:hover {
        background: ${({ theme }) => theme.colors.primaryHover};
        border-color: ${({ theme }) => theme.colors.primaryHover};
    }
`

/**
 * Shown for any URL that matches no route.
 *
 * Replaces a silent redirect to the home page, which told visitors nothing
 * and let Google record every dead link as a duplicate of the home page.
 * `noindex` keeps these out of search: a static host serves the SPA shell
 * with a 200, so the status code cannot say 404.
 */
export default function NotFound() {
    return (
        <>
            <SEO noindex title={`Page Not Found | ${COMPANY_CONFIG.name}`} />
            <Wrap>
                <Code>404</Code>
                <Title>We Couldn’t Find That Page</Title>
                <Body>
                    That page doesn’t exist. Your worries are right where you
                    left them.
                </Body>
                <Actions>
                    <PrimaryAction to="/">Back To My Worries</PrimaryAction>
                </Actions>
            </Wrap>
        </>
    )
}
