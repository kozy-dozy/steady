import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import type { WorryDto, WorryType } from '@shared/dtos'

dayjs.extend(relativeTime)

export function worryType(w: Pick<WorryDto, 'isAnxiety' | 'isDepression'>): WorryType {
    if (w.isAnxiety && w.isDepression) return 'both'
    return w.isDepression ? 'depression' : 'anxiety'
}

export function typeFlags(type: WorryType) {
    return { isAnxiety: type !== 'depression', isDepression: type !== 'anxiety' }
}

export const ago = (iso: string) => (iso ? dayjs(iso).fromNow() : '')

export const longDate = (iso: string) => (iso ? dayjs(iso).format('MMM D, h:mm a') : 'Not yet')

export const todayLabel = () => dayjs().format('dddd, MMMM D')

export const LAST_CATEGORY_KEY = 'steady.lastCategoryId'

export function rememberCategory(id: string) {
    try {
        localStorage.setItem(LAST_CATEGORY_KEY, id)
    } catch {
        // private mode: not remembered
    }
}

export function lastCategory(): string {
    try {
        return localStorage.getItem(LAST_CATEGORY_KEY) ?? ''
    } catch {
        return ''
    }
}

export const errorMessage = (err: any, fallback = 'Something went wrong. Please try again.') =>
    err?.error || err?.message || fallback
