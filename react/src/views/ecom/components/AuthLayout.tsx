import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import Logo from '@/components/template/Logo'
import { COMPANY_CONFIG } from '@/config/company.config'
import { SITE_IMAGES } from '@/config/site-images'
import HelpCard from '@/views/app/components/HelpCard'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 100vh;
`

const Grid = styled.div`
    display: grid;
    min-height: 100vh;
    grid-template-columns: 1fr;

    @media (min-width: 1024px) {
        grid-template-columns: 5fr 6fr;
    }
`

/* ── Left panel: calm photo (falls back to primaryLight until the file exists) ── */
const LeftPanel = styled.div`
    position: relative;
    display: none;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.primaryLight};

    img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @media (min-width: 1024px) {
        display: block;
    }
`

const Caption = styled.div`
    position: absolute;
    left: ${({ theme }) => theme.spacing['2xl']};
    bottom: ${({ theme }) => theme.spacing['2xl']};
    right: ${({ theme }) => theme.spacing['2xl']};
    max-width: 30ch;
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: rgba(255, 255, 255, 0.86);
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: ${({ theme }) => theme.fontSize.xl};
    font-weight: 600;
    line-height: 1.3;
`

/* ── Right panel — form ── */
const RightPanel = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing.lg}`};
    background-color: ${({ theme }) => theme.colors.bg.page};
`

const MobileBrand = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${({ theme }) => theme.spacing.xl};

    @media (min-width: 1024px) {
        display: none;
    }
`

const FormCard = styled.div`
    width: 100%;
    max-width: 420px;
    background: ${({ theme }) => theme.colors.bg.card};
    border-radius: ${({ theme }) => theme.radius.xl};
    box-shadow: ${({ theme }) => theme.shadow.md};
    padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing.xl}`};

    @media (min-width: 1280px) {
        max-width: 460px;
        padding: ${({ theme }) => theme.spacing['3xl']}
            ${({ theme }) => theme.spacing['2xl']};
    }
`

const HelpWrap = styled.div`
    width: 100%;
    max-width: 420px;
    margin-top: ${({ theme }) => theme.spacing.lg};

    @media (min-width: 1280px) {
        max-width: 460px;
    }
`

export default function AuthLayout() {
    const photo = SITE_IMAGES.auth.login
    return (
        <Wrapper>
            <Grid>
                <LeftPanel>
                    <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <Caption>{COMPANY_CONFIG.tagline}</Caption>
                </LeftPanel>

                <RightPanel>
                    <MobileBrand>
                        <Logo />
                    </MobileBrand>
                    <FormCard>
                        <Outlet />
                    </FormCard>
                    <HelpWrap>
                        <HelpCard showEmergency />
                    </HelpWrap>
                </RightPanel>
            </Grid>
        </Wrapper>
    )
}
