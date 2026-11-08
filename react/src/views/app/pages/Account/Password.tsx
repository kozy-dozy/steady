import { PasswordField } from '@kozy-dozy/forms'
import isLastChild from '@kozy-dozy/foundation/utils/isLastChild'
import Button from '@kozy-dozy/ui/Button'
import { FormContainer } from '@kozy-dozy/ui/Form'
import Notification from '@kozy-dozy/ui/Notification'
import Tag from '@kozy-dozy/ui/Tag'
import toast from '@kozy-dozy/ui/toast'
import dayjs from 'dayjs'
import { Form, Formik } from 'formik'
import {
    HiOutlineDesktopComputer,
    HiOutlineDeviceMobile,
    HiOutlineDeviceTablet,
} from 'react-icons/hi'
import styled from 'styled-components'
import * as Yup from 'yup'


import { apiUpdateMyPassword } from '@/services/shared/AccountService'
import { yupFields } from '@/utils/validation/yupValidation'

import FormDescription from './FormDescription'

const ButtonRow = styled.div`
    margin-top: ${({ theme }) => theme.spacing.md};
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
`

const MarginTop = styled.div`
    margin-top: ${({ theme }) => theme.spacing.lg};
`

const LoginHistoryList = styled.div`
    border-radius: ${({ theme }) => theme.radius.lg};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    margin-top: ${({ theme }) => theme.spacing.lg};
    overflow: hidden;
`

const LoginHistoryItem = styled.div<{ $border?: boolean }>`
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
    border-bottom: ${({ $border, theme }) =>
        $border ? `1px solid ${theme.colors.border.default}` : 'none'};
    background: ${({ theme }) => theme.colors.bg.card};
`

const FlexRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
`

const IconCol = styled.div`
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
`

const DeviceInfo = styled.div`
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
`

const DeviceName = styled.div`
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
`

const StyledTag = styled(Tag)`
    background: ${({ theme }) => theme.colors.status.successBg};
    color: ${({ theme }) => theme.colors.status.success};
    border-radius: ${({ theme }) => theme.radius.sm};
    border: none;
    margin: 0 ${({ theme }) => theme.spacing.sm};
    font-size: 13px;
    font-weight: 600;
    padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
`

type LoginHistory = {
    type: string
    deviceName: string
    time: number
    location: string
}

type PasswordFormModel = {
    password: string
    newPassword: string
    confirmNewPassword: string
}

const LoginHistoryIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Desktop':
            return <HiOutlineDesktopComputer />
        case 'Mobile':
            return <HiOutlineDeviceMobile />
        case 'Tablet':
            return <HiOutlineDeviceTablet />
        default:
            return <HiOutlineDesktopComputer />
    }
}

const validationSchema: Yup.ObjectSchema<PasswordFormModel> = Yup.object({
    password: yupFields.passwordRequired,
    newPassword: yupFields.newPasswordRequiredStrong,
    confirmNewPassword: yupFields.confirmNewPasswordMatches,
}).required()

const Password = ({ data }: { data?: LoginHistory[] }) => {
    const onFormSubmit = async (
        values: PasswordFormModel,
        setSubmitting: (isSubmitting: boolean) => void,
        resetForm: () => void,
    ) => {
        try {
            await apiUpdateMyPassword({
                password: values.password,
                newPassword: values.newPassword,
            })

            toast.push(
                <Notification title="Password updated" type="success" />,
                { placement: 'top-center' },
            )

            resetForm()
        } catch (error: unknown) {
            const err = error as { error?: string }
            toast.push(
                <Notification
                    title={err?.error || 'Update failed'}
                    type="danger"
                />,
                { placement: 'top-center' },
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Formik<PasswordFormModel>
                validateOnMount
                validateOnChange
                validateOnBlur
                initialValues={{
                    password: '',
                    newPassword: '',
                    confirmNewPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    setSubmitting(true)
                    onFormSubmit(values, setSubmitting, resetForm)
                }}
            >
                {({ isSubmitting, resetForm, dirty, isValid }) => (
                    <Form>
                        <FormContainer>
                            <FormDescription
                                title="Password"
                                desc="Enter your current & new password to reset your password"
                            />

                            <PasswordField
                                name="password"
                                label="Current Password"
                                placeholder="Current Password"
                            />

                            <PasswordField
                                name="newPassword"
                                label="New Password"
                                placeholder="New Password"
                            />

                            <PasswordField
                                name="confirmNewPassword"
                                label="Confirm Password"
                                placeholder="Confirm Password"
                            />

                            <ButtonRow>
                                <Button
                                    style={{ marginRight: 8 }}
                                    type="button"
                                    onClick={() => resetForm()}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                    disabled={
                                        !dirty || !isValid || isSubmitting
                                    }
                                >
                                    {isSubmitting
                                        ? 'Updating'
                                        : 'Update Password'}
                                </Button>
                            </ButtonRow>
                        </FormContainer>
                    </Form>
                )}
            </Formik>

            <MarginTop>
                <FormDescription
                    title="Where you're signed in"
                    desc="You're signed in to your account on these devices."
                />
                {data && (
                    <LoginHistoryList>
                        {data.map((log, index) => (
                            <LoginHistoryItem
                                key={index}
                                $border={!isLastChild(data, index)}
                            >
                                <FlexRow>
                                    <IconCol>
                                        <LoginHistoryIcon type={log.type} />
                                    </IconCol>
                                    <DeviceInfo>
                                        <FlexRow>
                                            <DeviceName>{log.deviceName}</DeviceName>
                                            {index === 0 && (
                                                <StyledTag>
                                                    <span>Current</span>
                                                </StyledTag>
                                            )}
                                        </FlexRow>
                                        <div>
                                            <span>
                                                {log.location}{' '}
                                                {dayjs(log.time).format('DD-MMM-YYYY, hh:mm A')}
                                            </span>
                                        </div>
                                    </DeviceInfo>
                                </FlexRow>
                            </LoginHistoryItem>
                        ))}
                    </LoginHistoryList>
                )}
            </MarginTop>
        </>
    )
}

export default Password
