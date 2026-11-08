import ApiService from './ApiService'

import type {
    SignUpCredential,
    SignInCredential,
    SignInResponse,
    SignUpResponse,
    ResendVerificationEmail,
} from '@/@types/auth'
import type { MessageResponse } from '@/utils/hooks/useAuth'

export type ForgotPasswordResponse = {
    message: string
}

export type ResetPasswordPayload = {
    token: string
    password: string
}

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse, SignInCredential>({
        url: '/auth/signin',
        method: 'POST',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse, SignUpCredential>({
        url: '/auth/signup',
        method: 'POST',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData<void>({
        url: '/auth/signout',
        method: 'POST',
    })
}

export async function apiForgotPassword(data: { email: string }) {
    return ApiService.fetchData<ForgotPasswordResponse, { email: string }>({
        url: '/auth/forgot-password',
        method: 'POST',
        data,
    })
}

export async function apiResetPassword(data: ResetPasswordPayload) {
    return ApiService.fetchData<MessageResponse, ResetPasswordPayload>({
        url: '/auth/reset-password',
        method: 'POST',
        data,
    })
}

export async function apiResendVerificationEmail(
    data: ResendVerificationEmail,
) {
    return ApiService.fetchData<MessageResponse, ResendVerificationEmail>({
        url: '/auth/resend-verification',
        method: 'POST',
        data,
    })
}

export async function apiMe<T = SignInResponse>() {
    return ApiService.fetchData<T>({
        url: '/auth/me',
        method: 'GET',
    })
}

export async function apiRefreshToken<T = any>() {
    return ApiService.fetchData<T, Record<string, never>>({
        url: '/auth/refresh',
        method: 'POST',
    })
}
