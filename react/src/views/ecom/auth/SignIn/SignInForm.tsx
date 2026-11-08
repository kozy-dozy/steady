
import {
    CheckboxField,
    PasswordField,
    TextField,
} from '@kozy-dozy/forms'
import ActionLink from '@kozy-dozy/shared/ActionLink'
import Alert from '@kozy-dozy/ui/Alert'
import Button from '@kozy-dozy/ui/Button'
import { FormContainer } from '@kozy-dozy/ui/Form'
import { Form, Formik } from 'formik'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import useAuth from '@/utils/hooks/useAuth'
import { yupFields } from '@/utils/validation/yupValidation'

import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    forgotPasswordUrl?: string
}

type SignInFormSchema = {
    email: string
    password: string
    rememberMe: boolean
}

type Mode = 'login' | 'resend'

const AlertWrapper = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ForgotRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const FooterRow = styled.div`
    margin-top: ${({ theme }) => theme.spacing.md};
    text-align: center;
`

const ResendLink = styled(ActionLink)`
    padding: 0;
    margin: 0;
    display: block;
    text-decoration: underline;
    font-size: ${({ theme }) => theme.fontSize.sm};
    font-weight: 400;
    margin-top: ${({ theme }) => theme.spacing.xs};
`

const SignInForm = (props: SignInFormProps) => {
    const [mode, setMode] = useState<Mode>('login')
    const [alert, setAlert] = useState<{
        type: 'success' | 'danger'
        text: string
    } | null>(null)

    const {
        className,
        forgotPasswordUrl = '/forgot-password',
    } = props

    const { signIn, resendVerificationEmail } = useAuth()

    const loginSchema = useMemo(
        () =>
            Yup.object({
                email: yupFields.email,
                password: yupFields.passwordRequired,
                rememberMe: Yup.boolean().default(true),
            }),
        [],
    )

    const resendSchema = useMemo(
        () =>
            Yup.object({
                email: yupFields.email,
                password: Yup.string().default(''),
                rememberMe: Yup.boolean().default(true),
            }),
        [],
    )

    const validationSchema = mode === 'login' ? loginSchema : resendSchema

    const onSubmit = async (
        values: SignInFormSchema,
        setSubmitting: (b: boolean) => void,
        resetForm: () => void,
    ) => {
        setSubmitting(true)
        setAlert(null)

        try {
            if (mode === 'resend') {
                const result = await resendVerificationEmail({
                    email: values.email,
                })

                setAlert({
                    type: 'success',
                    text: result?.message || 'Verification email resent.',
                })

                setMode('login')
                resetForm()
                setSubmitting(false)
                return
            }

            const result = await signIn({
                email: values.email,
                password: values.password,
                rememberMe: values.rememberMe,
            } as any)

            if (result?.status === 'failed') {
                setAlert({ type: 'danger', text: result.message })
            } else {
                setAlert({ type: 'success', text: result?.message || '' })
            }
        } catch (err: any) {
            setAlert({
                type: 'danger',
                text: err?.error || err?.message || 'Something went wrong.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const showResendLink =
        mode === 'login' &&
        !!alert?.text &&
        alert.text.toLowerCase().includes('confirm your email')

    return (
        <div className={className}>
            {alert && (
                <AlertWrapper>
                    <Alert
                        showIcon
                        closable
                        type={alert.type}
                        duration={0}
                        onClose={() => setAlert(null)}
                    >
                        {alert.text}
                        {showResendLink && (
                            <ResendLink
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setMode('resend')
                                    setAlert(null)
                                }}
                            >
                                Didn`t get the email? Resend verification
                            </ResendLink>
                        )}
                    </Alert>
                </AlertWrapper>
            )}

            <Formik<SignInFormSchema>
                validateOnMount
                validateOnChange
                validateOnBlur
                enableReinitialize
                initialValues={{
                    email: '',
                    password: '',
                    rememberMe: true,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm }) =>
                    onSubmit(values, setSubmitting, resetForm)
                }
            >
                {({ isSubmitting, dirty, isValid, errors }) => (
                    <Form>
                        <FormContainer>
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="Email"
                            />

                            {mode === 'login' && (
                                <>
                                    <PasswordField
                                        name="password"
                                        label="Password"
                                        placeholder="Password"
                                    />

                                    <ForgotRow>
                                        <CheckboxField name="rememberMe">
                                            Remember Me
                                        </CheckboxField>

                                        <ActionLink to={forgotPasswordUrl}>
                                            Forgot Password?
                                        </ActionLink>
                                    </ForgotRow>
                                </>
                            )}

                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                disabled={
                                    mode === 'login'
                                        ? !dirty || !isValid || isSubmitting
                                        : !dirty ||
                                          !!errors.email ||
                                          isSubmitting
                                }
                            >
                                {isSubmitting
                                    ? mode === 'login'
                                        ? 'Signing in...'
                                        : 'Sending...'
                                    : mode === 'login'
                                      ? 'Sign In'
                                      : 'Resend Verification Email'}
                            </Button>

                            {mode === 'resend' ? (
                                <FooterRow>
                                    <ActionLink
                                        to="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setMode('login')
                                            setAlert(null)
                                        }}
                                    >
                                        Back to sign in
                                    </ActionLink>
                                </FooterRow>
                            ) : null}
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignInForm
