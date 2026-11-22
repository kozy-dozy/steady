import appConfig from '@kozy-dozy/foundation/config/app.config'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import {
    apiSignIn,
    apiSignUp,
    apiSignOut,
    apiResendVerificationEmail,
    apiMe,
    apiRefreshToken,
} from '@/services/shared/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
    setInitialized,
} from '@/store'

import { trackEvent } from '../analytics/googleAnalytics'

import useQuery from './useQuery'

import type {
    ResendVerificationEmail,
    SignInCredential,
    SignUpCredential,
} from '@/@types/auth'

type Status = 'success' | 'failed'
type AuthResult =
    | {
          status: Status
          message: string
      }
    | undefined

type AuthResponse = {
    member?: {
        id?: string
        avatar?: string
        firstName?: string
        lastName?: string
        authority?: string[]
        email?: string
    }
    message?: string
}

export type MessageResponse = {
    message?: string
    error?: string
}

function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const query = useQuery()

    const { signedIn, initialized } = useAppSelector(
        (state) => state.auth.session,
    )
    const user = useAppSelector((state) => state.auth.user) // ✅ assuming you have this slice

    const [checkingSession, setCheckingSession] = useState(false)

    const applyUser = useCallback(
        (data: AuthResponse) => {
            const member = data?.member
            if (member?.id) {
                dispatch(
                    setUser({
                        id: member.id,
                        avatar: member.avatar || '',
                        firstName: member.firstName || '',
                        lastName: member.lastName || '',
                        email: member.email || '',
                        authority: member.authority || [],
                    }),
                )
                dispatch(signInSuccess('cookie')) // token is not needed here
                return true
            }
            return false
        },
        [dispatch],
    )

    const getErrorMessage = (err: unknown) => {
        if (typeof err === 'string') return err
        if (err && typeof err === 'object') {
            const maybe = err as { message?: string; error?: string }
            return maybe.message || maybe.error || JSON.stringify(err)
        }
        return 'Something went wrong.'
    }

    // ✅ Call your "who am I" endpoint to validate cookie and hydrate user
    const refreshSession = useCallback(async () => {
        setCheckingSession(true)
        try {
            const data = await apiMe<AuthResponse>()
            const ok = applyUser(data)
            if (!ok) dispatch(signOutSuccess())
            return ok
        } catch (err: any) {
            // ✅ if we *thought* we were signed in, try refresh then retry /me once
            if (signedIn) {
                try {
                    await apiRefreshToken()
                    const data = await apiMe<AuthResponse>()
                    const ok = applyUser(data)
                    if (!ok) dispatch(signOutSuccess())
                    return ok
                } catch {
                    dispatch(signOutSuccess())
                    return false
                }
            }

            // ✅ if we weren’t signed in, a 401 is normal
            dispatch(signOutSuccess())
            return false
        } finally {
            dispatch(setInitialized(true))
            setCheckingSession(false)
        }
    }, [applyUser, dispatch, signedIn])

    useEffect(() => {
        // ✅ don’t spam /auth/me on every page mount
        if (!initialized) {
            refreshSession()
        }
    }, [initialized, refreshSession])

    const applyAuthSuccess = (data: AuthResponse) => {
        const ok = applyUser(data)
        if (!ok) return

        const redirectUrl = query.get(REDIRECT_URL_KEY)
        navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath)
    }

    const signIn = async (values: SignInCredential): Promise<AuthResult> => {
        try {
            const data = (await apiSignIn(values)) as AuthResponse

            if (data?.member?.id) {
                trackEvent('login_success', { source: 'dialog' })
                applyAuthSuccess(data)
                return {
                    status: 'success',
                    message: data.message || 'Signed in',
                }
            }

            trackEvent('login_failed', { reason: 'no_member' })
            return {
                status: 'failed',
                message: data?.message || 'Sign in failed.',
            }
        } catch (err) {
            trackEvent('login_failed', { reason: 'exception' })
            return { status: 'failed', message: getErrorMessage(err) }
        }
    }

    const signUp = async (values: SignUpCredential): Promise<AuthResult> => {
        try {
            const data = (await apiSignUp(values)) as unknown as AuthResponse
            trackEvent('sign_up_success')
            return { status: 'success', message: data?.message || 'Account created.' }
        } catch (err) {
            trackEvent('sign_up_failed')
            return { status: 'failed', message: getErrorMessage(err) }
        }
    }

    const resendVerificationEmail = async (
        values: ResendVerificationEmail,
    ): Promise<AuthResult> => {
        trackEvent('resend_verification_submit')

        try {
            const data = await apiResendVerificationEmail(values)

            if (data?.message) {
                trackEvent('resend_verification_success')
                return { status: 'success', message: data.message }
            } else {
                trackEvent('resend_verification_failed', {
                    reason: data?.error || 'unknown',
                })
                return {
                    status: 'failed',
                    message: data?.error || 'Resend failed.',
                }
            }
        } catch (err) {
            return { status: 'failed', message: getErrorMessage(err) }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                id: '',
                avatar: '',
                firstName: '',
                lastName: '',
                email: '',
                authority: [],
            }),
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        try {
            await apiSignOut()
            trackEvent('logout_success')
        } catch (e: any) {
            trackEvent('logout_failed', { reason: getErrorMessage(e) })
        } finally {
            handleSignOut()
        }
    }

    // ✅ This is your reliable "logged in" flag
    const isAuthenticated = !!signedIn && !!user?.id

    return {
        isAuthenticated,
        checkingSession,
        user,
        refreshSession,
        signIn,
        signUp,
        signOut,
        resendVerificationEmail,
    }
}

export default useAuth
