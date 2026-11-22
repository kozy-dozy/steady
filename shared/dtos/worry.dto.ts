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
    actionItemMaxLength: 240,
    /** Open (not done) action items allowed at once, so the list never feels like a pile. */
    actionItemsOpenMax: 3,
    reframeMaxLength: 600,
    notesMaxLength: 2000,
    intensityMin: 1,
    intensityMax: 10,
    pageSize: 20,
} as const

/** One small, concrete step for a worry. Text is encrypted at rest. */
export interface ActionItemDto {
    id: string
    text: string
    done: boolean
    createdAt: string
    /** '' while open. */
    doneAt: string
}

export interface WorryDto {
    id: string
    categoryId: string
    description: string
    isAnxiety: boolean
    isDepression: boolean
    intensity: number
    control: WorryControl
    status: WorryStatus
    /** Open items first (oldest first; the first one is "next"), then done items (newest first). */
    actionItems: ActionItemDto[]
    reframe: string
    notes: string
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
    /** Quick add: optional first action item. More are added on the edit screen. */
    firstActionItem?: string
    reframe?: string
    notes?: string
}

/** Action items change through their own routes, not PATCH /api/worries/:id. */
export type WorryPatchInput = Partial<Omit<WorryCreateInput, 'firstActionItem'>>

/** POST /api/worries/:id/action-items */
export interface ActionItemCreateInput {
    text: string
}

/** PATCH /api/worries/:id/action-items/:itemId */
export interface ActionItemPatchInput {
    done: boolean
}

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
