
import { TextField } from '@kozy-dozy/forms'
import ActionLink from '@kozy-dozy/shared/ActionLink'
import Alert from '@kozy-dozy/ui/Alert'
import Button from '@kozy-dozy/ui/Button'
import { FormContainer } from '@kozy-dozy/ui/Form'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import { apiForgotPassword } from '@/services/shared/AuthService'
import { trackEvent } from '@/utils/analytics/googleAnalytics'
import { yupFields } from '@/utils/validation/yupValidation'

import type { CommonProps } from '@/@types/common'

interface ForgotPasswordFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type ForgotPasswordFormSchema = {
    email: string
}

const validationSchema: Yup.ObjectSchema<ForgotPasswordFormSchema> = Yup.object(
    {
        email: yupFields.email,
    },
).required()

const Header = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: ${({ theme }) => theme.fontSize['3xl']};
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.colors.text.dark};
`

const Subtitle = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.md};
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.text.secondary};
`

const AlertWrapper = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.md};
`

const FooterRow = styled.div`
    margin-top: ${({ theme }) => theme.spacing.md};
    text-align: center;
`

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [alert, setAlert] = useState<{
        type: 'success' | 'danger'
        text: string
    } | null>(null)

    const { className, signInUrl = '/sign-in' } = props
    const [emailSent, setEmailSent] = useState(false)

    const onSendMail = async (
        values: ForgotPasswordFormSchema,
        setSubmitting: (b: boolean) => void,
    ) => {
        setSubmitting(true)
        setAlert(null)

        trackEvent('forgot_password_submit', {
            mode: emailSent ? 'resend' : 'send',
        })

        try {
            const result = await apiForgotPassword(values)
            setEmailSent(true)
            trackEvent('forgot_password_success', {
                mode: emailSent ? 'resend' : 'send',
            })
            setAlert({ type: 'success', text: result?.message || '' })
        } catch (err: any) {
            trackEvent('forgot_password_failed', {
                mode: emailSent ? 'resend' : 'send',
                reason: err?.error || err?.message || 'unknown',
            })
            setAlert({
                type: 'danger',
                text: err?.error || err?.message || 'Failed to send email.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Header>
                {emailSent ? (
                    <>
                        <Title>Check your email</Title>
                        <Subtitle>
                            We have sent a password recovery instruction to your
                            email
                        </Subtitle>
                    </>
                ) : (
                    <>
                        <Title>Forgot Password</Title>
                        <Subtitle>
                            Please enter your email address to receive a
                            verification code
                        </Subtitle>
                    </>
                )}
            </Header>

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
                    </Alert>
                </AlertWrapper>
            )}

            <Formik<ForgotPasswordFormSchema>
                validateOnMount
                validateOnChange
                validateOnBlur
                initialValues={{ email: '' }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) =>
                    onSendMail(values, setSubmitting)
                }
            >
                {({ isSubmitting, isValid, dirty }) => (
                    <Form>
                        <FormContainer>
                            {!emailSent ? (
                                <TextField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="Email"
                                />
                            ) : null}

                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                disabled={!dirty || !isValid || isSubmitting}
                            >
                                {emailSent ? 'Resend Email' : 'Send Email'}
                            </Button>

                            <FooterRow>
                                <span>Back to </span>
                                <ActionLink
                                    to={signInUrl}
                                    onClick={() =>
                                        trackEvent(
                                            'forgot_password_back_to_sign_in',
                                        )
                                    }
                                >
                                    Sign in
                                </ActionLink>
                            </FooterRow>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ForgotPasswordForm
