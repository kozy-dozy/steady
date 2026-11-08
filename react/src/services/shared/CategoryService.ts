import ApiService from './ApiService'

import type { CategoryCreateInput, CategoryDto, CategoryPatchInput } from '@shared/dtos'

export const apiListCategories = (includeArchived = false) =>
    ApiService.fetchData<{ categories: CategoryDto[] }>({
        url: '/categories',
        method: 'GET',
        params: includeArchived ? { includeArchived: 1 } : undefined,
    })

export const apiCreateCategory = (data: CategoryCreateInput) =>
    ApiService.fetchData<{ category: CategoryDto }, CategoryCreateInput>({ url: '/categories', method: 'POST', data })

export const apiUpdateCategory = (id: string, data: CategoryPatchInput) =>
    ApiService.fetchData<{ category: CategoryDto }, CategoryPatchInput>({ url: `/categories/${id}`, method: 'PATCH', data })

export const apiReorderCategories = (ids: string[]) =>
    ApiService.fetchData<{ ok: boolean }, { ids: string[] }>({ url: '/categories/reorder', method: 'PATCH', data: { ids } })
