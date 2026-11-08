/** Worries: one entry on the worry list (anxiety and/or depression), owned by one user. */

export const WORRY_CONTROLS = ['yes', 'partly', 'no'] as const
export type WorryControl = (typeof WORRY_CONTROLS)[number]
export const WORRY_CONTROL_LABELS: Record<WorryControl, string> = {
    yes: 'Yes',
    partly: 'Partly',
    no: 'No',
}

export const WORRY_STATUSES = ['active', 'improving', 'resolved'] as const
export type WorryStatus = (typeof WORRY_STATUSES)[number]
export const WORRY_STATUS_LABELS: Record<WorryStatus, string> = {
    active: 'Active',
    improving: 'Improving',
    resolved: 'Resolved',
}

/** Filter value for the Anxiety / Depression / Both toggle. */
export const WORRY_TYPES = ['anxiety', 'depression', 'both'] as const
export type WorryType = (typeof WORRY_TYPES)[number]
export const WORRY_TYPE_LABELS: Record<WorryType, string> = {
    anxiety: 'Anxiety',
    depression: 'Depression',
    both: 'Both',
}

export const WORRY_SORTS = ['newest', 'oldest', 'intensity'] as const
export type WorrySort = (typeof WORRY_SORTS)[number]

export const WORRY_LIMITS = {
    descriptionMaxLength: 500,
    nextStepMaxLength: 240,
    reframeMaxLength: 600,
    notesMaxLength: 2000,
    tagsMax: 10,
    tagMaxLength: 30,
    intensityMin: 1,
    intensityMax: 10,
    pageSize: 20,
} as const

export interface WorryDto {
    id: string
    categoryId: string
    description: string
    isAnxiety: boolean
    isDepression: boolean
    intensity: number
    control: WorryControl
    status: WorryStatus
    nextStep: string
    reframe: string
    notes: string
    tags: string[]
    createdAt: string
    updatedAt: string
    /** '' until the status first becomes resolved; cleared if it is reopened. */
    resolvedAt: string
}

export interface WorryCreateInput {
    categoryId: string
    description: string
    isAnxiety: boolean
    isDepression: boolean
    intensity: number
    control?: WorryControl
    status?: WorryStatus
    nextStep?: string
    reframe?: string
    notes?: string
    tags?: string[]
}

export type WorryPatchInput = Partial<WorryCreateInput>

export interface WorryListQuery {
    categoryId?: string
    /** Exact match: anxiety only, depression only, or both. Omit for all. */
    type?: WorryType
    /** Comma-separated statuses, e.g. "active,improving". Omit for all. */
    status?: string
    control?: WorryControl
    sort?: WorrySort
    page?: number
}

export interface WorryListResponse {
    worries: WorryDto[]
    total: number
    page: number
    pageSize: number
}

export interface WorrySummaryDto {
    active: number
    improving: number
    resolved: number
    /** Average intensity of active + improving worries, 1 decimal; 0 when none. */
    avgOpenIntensity: number
}

/** POST /api/worries/similar: text sent in the body (never the URL) so it stays out of logs. */
export interface WorrySimilarInput {
    description: string
    /** Leave out the worry being edited. */
    excludeId?: string
}

export interface WorryMatchDto {
    worry: WorryDto
    /** 0..1, higher is more alike. */
    score: number
}

export interface WorrySimilarResponse {
    matches: WorryMatchDto[]
}

export interface WorryDuplicateGroupDto {
    /** Newest first. */
    worries: WorryDto[]
    /** Highest pair score in the group. */
    score: number
}

export interface WorryDuplicatesResponse {
    groups: WorryDuplicateGroupDto[]
}
