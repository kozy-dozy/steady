import ApiService from './ApiService'

import type { BrightSpotDto, BrightSpotImageInput, BrightSpotImageResponse, BrightSpotInput } from '@shared/dtos'

/** Newest first. */
export const apiListBrightSpots = () =>
    ApiService.fetchData<{ brightSpots: BrightSpotDto[] }>({ url: '/bright-spots', method: 'GET' })

export const apiCreateBrightSpot = (data: BrightSpotInput) =>
    ApiService.fetchData<{ brightSpot: BrightSpotDto }, BrightSpotInput>({ url: '/bright-spots', method: 'POST', data })

export const apiUpdateBrightSpot = (id: string, data: BrightSpotInput) =>
    ApiService.fetchData<{ brightSpot: BrightSpotDto }, BrightSpotInput>({ url: `/bright-spots/${id}`, method: 'PATCH', data })

export const apiDeleteBrightSpot = (id: string) =>
    ApiService.fetchData<{ ok: boolean }>({ url: `/bright-spots/${id}`, method: 'DELETE' })

// Optional photo. Bytes come back as base64 in JSON so the request goes through the same signed-in
// fetch (cookies, token refresh) as everything else, and the photo never has a public URL.
export const apiGetBrightSpotImage = (id: string) =>
    ApiService.fetchData<BrightSpotImageResponse>({ url: `/bright-spots/${id}/image`, method: 'GET' })

export const apiPutBrightSpotImage = (id: string, data: BrightSpotImageInput) =>
    ApiService.fetchData<{ brightSpot: BrightSpotDto }, BrightSpotImageInput>({ url: `/bright-spots/${id}/image`, method: 'PUT', data })

export const apiDeleteBrightSpotImage = (id: string) =>
    ApiService.fetchData<{ brightSpot: BrightSpotDto }>({ url: `/bright-spots/${id}/image`, method: 'DELETE' })
