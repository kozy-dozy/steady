import { PasswordField } from '@kozy-dozy/forms'
import ActionLink from '@kozy-dozy/shared/ActionLink'
import Alert from '@kozy-dozy/ui/Alert'
import Button from '@kozy-dozy/ui/Button'
import { FormContainer } from '@kozy-dozy/ui/Form'
import { Form, Formik } from 'formik'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import * as Yup from 'yup'


import { apiResetPassword } from '@/services/shared/AuthService'
import { yupFields } from '@/utils/validation/yupValidation'

import type { CommonProps } from '@/@types/common'

interface ResetPasswordFormProps extends CommonProps {
    signInUrl?: string
}

type ResetPasswordFormSchema = {
    password: string
    confirmPassword: string
}

const validationSchema: Yup.ObjectSchema<ResetPasswordFormSchema> = Yup.object({
    password: yupFields.newPasswordRequiredStrong,
    confirmPassword: yupFields.confirmPasswordMatches,
}).required()

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

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const [resetComplete, setResetComplete] = useState(false)
    const [alert, setAlert] = useState<{
        type: 'success' | 'danger'
        text: string
    } | null>(null)

    const { className, signInUrl = '/sign-in' } = props

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const token = useMemo(() => searchParams.get('token') || '', [searchParams])

    const onSubmit = async (
        values: ResetPasswordFormSchema,
        setSubmitting: (b: boolean) => void,
    ) => {
        setSubmitting(true)
        setAlert(null)

        if (!token) {
            setAlert({
                type: 'danger',
                text: 'Reset token is missing. Please use the link from your email again.',
            })
            setSubmitting(false)
            return
        }

        try {
            const result = await apiResetPassword({
                token,
                password: values.password,
            })

            setResetComplete(true)
            setAlert({
                type: 'success',
                text: result?.message || 'Password reset successful.',
            })
        } catch (err: any) {
            setAlert({
                type: 'danger',
                text: err?.error || err?.message || 'Failed to reset password.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const onContinue = () => {
        navigate(signInUrl)
    }

    return (
        <div className={className}>
            <Header>
                {resetComplete ? (
                    <>
                        <Title>Reset done</Title>
                        <Subtitle>
                            Your password has been successfully reset.
                        </Subtitle>
                    </>
                ) : (
                    <>
                        <Title>Set new password</Title>
                        <Subtitle>
                            Your new password must be different than your
                            previous password.
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

            <Formik<ResetPasswordFormSchema>
                validateOnMount
                validateOnChange
                validateOnBlur
                initialValues={{
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) =>
                    onSubmit(values, setSubmitting)
                }
            >
                {({ isSubmitting, isValid, dirty }) => (
                    <Form>
                        <FormContainer>
                            {!resetComplete ? (
                                <>
                                    <PasswordField
                                        name="password"
                                        label="Password"
                                        placeholder="Password"
                                    />

                                    <PasswordField
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        placeholder="Confirm Password"
                                    />

                                    <Button
                                        block
                                        loading={isSubmitting}
                                        variant="solid"
                                        type="submit"
                                        disabled={
                                            !dirty || !isValid || isSubmitting
                                        }
                                    >
                                        {isSubmitting
                                            ? 'Submitting...'
                                            : 'Submit'}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    block
                                    variant="solid"
                                    type="button"
                                    onClick={onContinue}
                                >
                                    Continue
                                </Button>
                            )}

                            <FooterRow>
                                <span>Back to </span>
                                <ActionLink to={signInUrl}>Sign in</ActionLink>
                            </FooterRow>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ResetPasswordForm
