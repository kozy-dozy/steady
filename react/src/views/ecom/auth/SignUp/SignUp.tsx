import appConfig from '@kozy-dozy/foundation/config/app.config'

import AuthHeader from '../AuthHeader'

import SignUpForm from './SignUpForm'

const { unAuthenticatedEntryPath } = appConfig

const SignUp = () => (
    <>
        <AuthHeader
            subtitle="Your own private worry list. Only you can see what you write."
            title="Create your account"
        />
        <SignUpForm signInUrl={unAuthenticatedEntryPath} />
    </>
)

export default SignUp
