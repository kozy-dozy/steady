import { PasswordField, RecaptchaField, TextField } from '@kozy-dozy/forms'
import ActionLink from '@kozy-dozy/shared/ActionLink'
import Alert from '@kozy-dozy/ui/Alert'
import Button from '@kozy-dozy/ui/Button'
import { FormContainer } from '@kozy-dozy/ui/Form'
import { Form, Formik } from 'formik'
import { useRef, useState } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import { INTEGRATIONS_CONFIG } from '@/config/integrations.config'
import useAuth from '@/utils/hooks/useAuth'
import { yupFields } from '@/utils/validation/yupValidation'

import type { CommonProps } from '@/@types/common'
import type ReCAPTCHA from 'react-google-recaptcha'

/**
 * Sign-up (dozy-donuts flow): name, email, password twice, and reCAPTCHA
 * when a site key is set. The API sends a confirmation link (or prints it to
 * the dev server log when MailerSend isn't set up); sign-in works once the
 * address is confirmed.
 */

interface SignUpFormProps extends CommonProps {
    signInUrl?: string
}

type SignUpFormSchema = {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

const RECAPTCHA_SITE_KEY = INTEGRATIONS_CONFIG.google.recaptchaSiteKey

// Any characters in names (the shared letters-only rule rejects "O'Brien").
const name = (label: string) =>
    Yup.string()
        .trim()
        .required(`${label} is required`)
        .max(100, `${label} must be 100 characters or fewer`)

const validationSchema: Yup.ObjectSchema<SignUpFormSchema> = Yup.object({
    firstName: name('First name'),
    lastName: name('Last name'),
    email: yupFields.email,
    password: yupFields.newPasswordRequiredStrong,
    confirmPassword: yupFields.confirmPasswordMatches,
}).required()

const AlertWrapper = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const NameGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    column-gap: ${({ theme }) => theme.spacing.md};

    @media (min-width: 480px) {
        grid-template-columns: 1fr 1fr;
    }
`

const RecaptchaWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Hint = styled.p`
    margin: 0 0 ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
`

const FooterRow = styled.p`
    margin: ${({ theme }) => theme.spacing.md} 0 0;
    text-align: center;
    font-size: ${({ theme }) => theme.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
`

const SignUpForm = ({ className, signInUrl = '/sign-in' }: SignUpFormProps) => {
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
    const [recaptchaError, setRecaptchaError] = useState('')
    const [alert, setAlert] = useState<{
        type: 'success' | 'danger'
        text: string
    } | null>(null)
    const recaptchaRef = useRef<ReCAPTCHA>(null)
    const { signUp } = useAuth()

    const needsRecaptcha = Boolean(RECAPTCHA_SITE_KEY)

    const onSignUp = async (values: SignUpFormSchema): Promise<boolean> => {
        if (needsRecaptcha && !recaptchaToken) {
            setRecaptchaError('Please complete the reCAPTCHA.')
            return false
        }

        setAlert(null)
        const result = await signUp({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            recaptchaToken: recaptchaToken ?? '',
        })

        if (result?.status === 'failed') {
            setAlert({ type: 'danger', text: result.message })
            recaptchaRef.current?.reset()
            setRecaptchaToken(null)
            return false
        }

        setAlert({
            type: 'success',
            text: 'Account created. Check your email for a confirmation link, then sign in.',
        })
        return true
    }

    return (
        <div className={className}>
            {alert && (
                <AlertWrapper>
                    <Alert closable showIcon duration={0} type={alert.type} onClose={() => setAlert(null)}>
                        {alert.text}
                    </Alert>
                </AlertWrapper>
            )}

            <Formik<SignUpFormSchema>
                validateOnMount
                initialValues={{
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    const ok = await onSignUp(values)
                    if (ok) resetForm()
                    setSubmitting(false)
                }}
            >
                {({ isSubmitting, isValid, dirty }) => (
                    <Form>
                        <FormContainer>
                            <NameGrid>
                                <TextField autoComplete="given-name" label="First name" name="firstName" placeholder="First name" />
                                <TextField autoComplete="family-name" label="Last name" name="lastName" placeholder="Last name" />
                            </NameGrid>

                            <TextField autoComplete="email" label="Email" name="email" placeholder="you@example.com" type="email" />

                            <PasswordField autoComplete="new-password" label="Password" name="password" placeholder="Password" />
                            <PasswordField autoComplete="new-password" label="Confirm password" name="confirmPassword" placeholder="Type it again" />
                            <Hint>
                                At least 8 characters with an uppercase letter, a lowercase letter, a number, and one of @ $ ! % * ? &amp;
                            </Hint>

                            {needsRecaptcha && (
                                <RecaptchaWrapper>
                                    <RecaptchaField
                                        ref={recaptchaRef}
                                        error={recaptchaError}
                                        siteKey={RECAPTCHA_SITE_KEY}
                                        onExpired={() => {
                                            setRecaptchaToken(null)
                                            setRecaptchaError('reCAPTCHA expired. Please verify again.')
                                        }}
                                        onTokenChange={(token: string | null) => {
                                            setRecaptchaToken(token)
                                            setRecaptchaError('')
                                        }}
                                    />
                                </RecaptchaWrapper>
                            )}

                            <Button
                                block
                                disabled={!dirty || !isValid || isSubmitting || (needsRecaptcha && !recaptchaToken)}
                                loading={isSubmitting}
                                type="submit"
                                variant="solid"
                            >
                                {isSubmitting ? 'Creating account…' : 'Create account'}
                            </Button>

                            <FooterRow>
                                Already have an account? <ActionLink to={signInUrl}>Sign in</ActionLink>
                            </FooterRow>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
