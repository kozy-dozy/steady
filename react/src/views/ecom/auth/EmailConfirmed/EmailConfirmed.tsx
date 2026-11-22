import appConfig from '@kozy-dozy/foundation/config/app.config'
import { useSearchParams } from 'react-router-dom'

import AuthHeader from '../AuthHeader'
import SignInForm from '../SignIn/SignInForm'

const { forgotPasswordUrl } = appConfig

// The API's confirm link redirects here for every outcome.
const MESSAGES = {
    confirmed: {
        title: 'Email confirmed',
        subtitle: 'Your account is ready. Sign in below.',
    },
    invalid: {
        title: 'That link didn’t work',
        subtitle:
            'It may have expired (links last 24 hours) or been replaced by a newer one. Sign in below and we’ll offer to send another.',
    },
} as const

type Status = keyof typeof MESSAGES

const isStatus = (value: string | null): value is Status => value === 'confirmed' || value === 'invalid'

const EmailConfirmed = () => {
    const [searchParams] = useSearchParams()
    const raw = searchParams.get('status')
    const { title, subtitle } = MESSAGES[isStatus(raw) ? raw : 'confirmed']

    return (
        <>
            <AuthHeader subtitle={subtitle} title={title} />
            <SignInForm forgotPasswordUrl={forgotPasswordUrl} />
        </>
    )
}

export default EmailConfirmed
