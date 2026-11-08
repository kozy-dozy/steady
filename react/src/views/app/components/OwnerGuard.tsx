import { ADMIN } from '@kozy-dozy/foundation/constants/roles.constant'
import Button from '@kozy-dozy/ui/Button'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAppSelector } from '@/store'
import useAuth from '@/utils/hooks/useAuth'

const Box = styled.div`
    max-width: 420px;
    margin: 20vh auto 0;
    padding: ${({ theme }) => theme.spacing.lg};
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`

/**
 * Steady is owner-only: the account must be created with `create:admin`.
 * (The shared AuthorityGuard redirects to "/", which is this same guarded route.)
 */
export default function OwnerGuard() {
    const authority = useAppSelector((s) => s.auth.user.authority) ?? []
    const { signOut } = useAuth()

    if (!authority.includes(ADMIN)) {
        return (
            <Box>
                <h1>This account can&apos;t open Steady.</h1>
                <p>Steady is a private app. Sign in with the owner account.</p>
                <Button variant="solid" onClick={signOut}>
                    Sign out
                </Button>
            </Box>
        )
    }
    return <Outlet />
}
