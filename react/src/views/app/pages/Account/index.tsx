import Button from '@kozy-dozy/ui/Button'
import { LuLogOut } from 'react-icons/lu'

import { useMember } from '@/store/domainHooks'
import useAuth from '@/utils/hooks/useAuth'

import HelpCard from '../../components/HelpCard'
import { Card, Muted, Page, SectionTitle, Title } from '../../components/ui'

import Password from './Password'

export default function Account() {
    const { member } = useMember()
    const { signOut } = useAuth()

    return (
        <Page style={{ maxWidth: 760 }}>
            <Title>Account</Title>
            <Card>
                <SectionTitle>Signed in as</SectionTitle>
                <div>
                    <strong>{[member?.firstName, member?.lastName].filter(Boolean).join(' ') || 'Owner'}</strong>
                    <br />
                    <Muted>{member?.email}</Muted>
                </div>
                <div>
                    <Button icon={<LuLogOut aria-hidden="true" />} onClick={signOut}>
                        Sign out
                    </Button>
                </div>
            </Card>
            <Card>
                <Password />
            </Card>
            <HelpCard showEmergency />
        </Page>
    )
}
