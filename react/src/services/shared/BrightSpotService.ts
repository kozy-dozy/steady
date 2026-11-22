import ApiService from './ApiService'

import type { BrightSpotDto, BrightSpotInput } from '@shared/dtos'

/** Newest first. */
export const apiListBrightSpots = () =>
    ApiService.fetchData<{ brightSpots: BrightSpotDto[] }>({ url: '/bright-spots', method: 'GET' })

export const apiCreateBrightSpot = (data: BrightSpotInput) =>
    ApiService.fetchData<{ brightSpot: BrightSpotDto }, BrightSpotInput>({ url: '/bright-spots', method: 'POST', data })

export const apiUpdateBrightSpot = (id: string, data: BrightSpotInput) =>
    ApiService.fetchData<{ brightSpot: BrightSpotDto }, BrightSpotInput>({ url: `/bright-spots/${id}`, method: 'PATCH', data })

export const apiDeleteBrightSpot = (id: string) =>
    ApiService.fetchData<{ ok: boolean }>({ url: `/bright-spots/${id}`, method: 'DELETE' })
