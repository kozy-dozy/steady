import { LuLayoutGrid, LuList, LuLogOut, LuPlus, LuUser } from 'react-icons/lu'
import { NavLink, Outlet } from 'react-router-dom'
import styled from 'styled-components'

import Logo from '@/components/template/Logo'
import { CONTENT_CONFIG } from '@/config/content.config'
import useAuth from '@/utils/hooks/useAuth'

import HelpCard, { HelpLink } from './HelpCard'

const NAV = [
    { to: '/', label: 'Worries', icon: LuList, end: true },
    { to: '/categories', label: 'Categories', icon: LuLayoutGrid, end: false },
    { to: '/account', label: 'Account', icon: LuUser, end: false },
]

const Frame = styled.div`
    display: flex;
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.bg.page};
`

const Sidebar = styled.aside`
    display: none;
    flex: 0 0 256px;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md}`};
    border-right: 1px solid ${({ theme }) => theme.colors.border.default};
    position: sticky;
    top: 0;
    height: 100vh;
    box-sizing: border-box;

    @media (min-width: 1024px) {
        display: flex;
    }
`

const SideNav = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;

    a {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 0 14px;
        border-radius: ${({ theme }) => theme.radius.full};
        color: ${({ theme }) => theme.colors.text.primary};
        text-decoration: none;
    }
    a:hover {
        background: ${({ theme }) => theme.colors.bg.hover};
    }
    a.active {
        background: ${({ theme }) => theme.colors.primaryLight};
        font-weight: 700;
    }
`

const SignOut = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 14px;
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text.muted};
    font: inherit;
    cursor: pointer;
    border-radius: ${({ theme }) => theme.radius.full};

    &:hover {
        background: ${({ theme }) => theme.colors.bg.hover};
    }
`

const SideFoot = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
`

const Main = styled.main`
    flex: 1 1 auto;
    min-width: 0;
`

const MobileHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.bg.page};

    @media (min-width: 1024px) {
        display: none;
    }
`

const Tabs = styled.nav`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: ${({ theme }) => theme.zIndex.dropdown};
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: calc(70px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.card};

    a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        min-width: 72px;
        min-height: 48px;
        font-size: ${({ theme }) => theme.fontSize.xs};
        color: ${({ theme }) => theme.colors.text.muted};
        text-decoration: none;
    }
    a.active {
        color: ${({ theme }) => theme.colors.primary};
        font-weight: 700;
    }

    @media (min-width: 1024px) {
        display: none;
    }
`

const Fab = styled(NavLink)`
    position: fixed;
    right: ${({ theme }) => theme.spacing.md};
    bottom: calc(86px + env(safe-area-inset-bottom));
    z-index: ${({ theme }) => theme.zIndex.dropdown};
    width: 62px;
    height: 62px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.inverse};
    box-shadow: ${({ theme }) => theme.shadow.lg};

    &.active {
        display: none;
    }

    @media (min-width: 1024px) {
        display: none;
    }
`

export default function AppShell() {
    const { signOut } = useAuth()

    return (
        <Frame>
            <Sidebar>
                <Logo />
                <SideNav aria-label="Main">
                    {NAV.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end}>
                            <Icon size={20} aria-hidden="true" />
                            {label}
                        </NavLink>
                    ))}
                </SideNav>
                <SideFoot>
                    <HelpCard />
                    <SignOut type="button" onClick={signOut}>
                        <LuLogOut size={18} aria-hidden="true" />
                        Sign out
                    </SignOut>
                </SideFoot>
            </Sidebar>

            <Main>
                <MobileHeader>
                    <Logo />
                    <HelpLink href={CONTENT_CONFIG.help.callHref} aria-label="Need help now? Call 988">
                        {CONTENT_CONFIG.help.short}
                    </HelpLink>
                </MobileHeader>
                <Outlet />
            </Main>

            <Fab to="/worries/new" aria-label="Add a worry">
                <LuPlus size={26} aria-hidden="true" />
            </Fab>
            <Tabs aria-label="Main">
                {NAV.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end}>
                        <Icon size={22} aria-hidden="true" />
                        {label}
                    </NavLink>
                ))}
            </Tabs>
        </Frame>
    )
}
