import appConfig from '@kozy-dozy/foundation/config/app.config'

import ForgotPasswordForm from '@/views/ecom/auth/ForgotPassword/ForgotPasswordForm'

const { unAuthenticatedEntryPath } = appConfig

const ForgotPassword = () => {
    return (
        <ForgotPasswordForm
            disableSubmit={true}
            signInUrl={`${unAuthenticatedEntryPath}`}
        />
    )
}

export default ForgotPassword
