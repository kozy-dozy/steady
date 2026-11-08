import ApiService from './ApiService'

import type { MemberDto } from '@shared/dtos'

export type AddressPayload = {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    instructions?: string
}

export type GetMeResponse = {
    member: MemberDto
}

export type UpdateMePayload = {
    firstName?: string
    lastName?: string
    avatar?: string
    shippingAddress?: AddressPayload
    billingAddress?: AddressPayload
}

export type UpdateMyPasswordPayload = {
    password: string
    newPassword: string
}

export type UpdateMyPasswordResponse = {
    message: string
}

// GET /members/me
export async function apiGetMe<T = GetMeResponse>() {
    return ApiService.fetchData<T>({
        url: '/members/me',
        method: 'GET',
    })
}

// PATCH /members/me  (profile + shipping/billing)
export async function apiUpdateMe<
    T = GetMeResponse,
    U extends Record<string, unknown> = UpdateMePayload,
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/members/me',
        method: 'PATCH',
        data,
    })
}

// PUT /members/me/password
export async function apiUpdateMyPassword<
    T = UpdateMyPasswordResponse,
    U extends Record<string, unknown> = UpdateMyPasswordPayload,
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/members/me/password',
        method: 'PUT',
        data,
    })
}

// POST /members/me/wishlist/toggle
export async function apiToggleMyWishlist<
    T = { favoriteProductIds: string[] },
>(productId: string) {
    return ApiService.fetchData<T>({
        url: '/members/me/wishlist/toggle',
        method: 'POST',
        data: { productId },
    })
}
