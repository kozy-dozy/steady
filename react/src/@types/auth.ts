export type SignInCredential = {
    email: string
    password: string
}

export type ResendVerificationEmail = {
    email: string
}

export type SignInResponse = {
    token: string
    user: {
        firstName: string
        lastName: string
        authority: string[]
        avatar: string
        email: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    firstName: string
    lastName: string
    email: string
    password: string
    recaptchaToken: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    token: string
    password: string
}
