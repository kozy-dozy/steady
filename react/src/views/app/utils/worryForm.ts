import { WORRY_CONTROLS, WORRY_LIMITS, WORRY_STATUSES, WORRY_TYPES } from '@shared/dtos'
import * as Yup from 'yup'

import { parseTags, typeFlags, worryType } from './worry'

import type { WorryControl, WorryCreateInput, WorryDto, WorryStatus, WorryType } from '@shared/dtos'

export interface WorryFormValues {
    categoryId: string
    description: string
    type: WorryType
    intensity: number
    control: WorryControl
    status: WorryStatus
    nextStep: string
    reframe: string
    notes: string
    tagsText: string
}

export const emptyWorry = (categoryId = ''): WorryFormValues => ({
    categoryId,
    description: '',
    type: 'anxiety',
    intensity: 5,
    control: 'partly',
    status: 'active',
    nextStep: '',
    reframe: '',
    notes: '',
    tagsText: '',
})

export const toFormValues = (w: WorryDto): WorryFormValues => ({
    categoryId: w.categoryId,
    description: w.description,
    type: worryType(w),
    intensity: w.intensity,
    control: w.control,
    status: w.status,
    nextStep: w.nextStep,
    reframe: w.reframe,
    notes: w.notes,
    tagsText: w.tags.join(', '),
})

export const toInput = (v: WorryFormValues): WorryCreateInput => ({
    categoryId: v.categoryId,
    description: v.description.trim(),
    ...typeFlags(v.type),
    intensity: v.intensity,
    control: v.control,
    status: v.status,
    nextStep: v.nextStep.trim(),
    reframe: v.reframe.trim(),
    notes: v.notes.trim(),
    tags: parseTags(v.tagsText),
})

export const worrySchema = Yup.object({
    categoryId: Yup.string().required('Pick a category.'),
    description: Yup.string().trim().required('Say it in a line.').max(WORRY_LIMITS.descriptionMaxLength),
    type: Yup.mixed<WorryType>().oneOf([...WORRY_TYPES]).required(),
    intensity: Yup.number().min(WORRY_LIMITS.intensityMin).max(WORRY_LIMITS.intensityMax).required(),
    control: Yup.mixed<WorryControl>().oneOf([...WORRY_CONTROLS]).required(),
    status: Yup.mixed<WorryStatus>().oneOf([...WORRY_STATUSES]).required(),
    nextStep: Yup.string().max(WORRY_LIMITS.nextStepMaxLength),
    reframe: Yup.string().max(WORRY_LIMITS.reframeMaxLength),
    notes: Yup.string().max(WORRY_LIMITS.notesMaxLength),
    tagsText: Yup.string().max(400),
})
