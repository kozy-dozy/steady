import ApiService from './ApiService'

import type {
    WorryCreateInput,
    WorryDto,
    WorryDuplicatesResponse,
    WorryListQuery,
    WorryListResponse,
    WorryPatchInput,
    WorrySimilarInput,
    WorrySimilarResponse,
    WorrySummaryDto,
} from '@shared/dtos'

export const apiListWorries = (query: WorryListQuery = {}) =>
    ApiService.fetchData<WorryListResponse>({ url: '/worries', method: 'GET', params: query })

export const apiGetWorrySummary = () =>
    ApiService.fetchData<{ summary: WorrySummaryDto }>({ url: '/worries/summary', method: 'GET' })

export const apiGetWorry = (id: string) =>
    ApiService.fetchData<{ worry: WorryDto }>({ url: `/worries/${id}`, method: 'GET' })

export const apiCreateWorry = (data: WorryCreateInput) =>
    ApiService.fetchData<{ worry: WorryDto }, WorryCreateInput>({ url: '/worries', method: 'POST', data })

export const apiUpdateWorry = (id: string, data: WorryPatchInput) =>
    ApiService.fetchData<{ worry: WorryDto }, WorryPatchInput>({ url: `/worries/${id}`, method: 'PATCH', data })

export const apiDeleteWorry = (id: string) =>
    ApiService.fetchData<{ ok: boolean }>({ url: `/worries/${id}`, method: 'DELETE' })

/** Text goes in the POST body, never the URL, so it stays out of server and proxy logs. */
export const apiFindSimilarWorries = (data: WorrySimilarInput) =>
    ApiService.fetchData<WorrySimilarResponse, WorrySimilarInput>({ url: '/worries/similar', method: 'POST', data })

export const apiFindDuplicateWorries = () =>
    ApiService.fetchData<WorryDuplicatesResponse>({ url: '/worries/duplicates', method: 'GET' })
