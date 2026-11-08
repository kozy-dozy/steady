import Joi from 'joi'

import {
    CATEGORY_COLORS,
    CATEGORY_ICONS,
    CATEGORY_LIMITS,
    WORRY_CONTROLS,
    WORRY_LIMITS,
    WORRY_SORTS,
    WORRY_STATUSES,
    WORRY_TYPES,
} from './domainConstants'

// Type interfaces
export interface SignUpData {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'family' | 'couple' | 'solo' | 'group'
    recaptchaToken: string
}

export interface SignInData {
    email: string
    password: string
    rememberMe?: boolean
}

/**
 * Password validation schema
 * Requires:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
        'string.pattern.base':
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
    })

export const emailSchema = Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required()
    .messages({
        'string.email': 'Invalid email address',
        'string.max': 'Email must not exceed 254 characters',
    })

export const signUpSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: Joi.string().trim().max(100).required(),
    lastName: Joi.string().trim().max(100).required(),
    // Empty when reCAPTCHA isn't configured (RECAPTCHA_SECRET_KEY unset).
    recaptchaToken: Joi.string().allow('').default(''),
}).unknown(false) // Reject unknown fields

export const signInSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(true),
}).unknown(false)

export const updateMemberSchema = Joi.object({
    firstName: Joi.string().trim().max(100),
    lastName: Joi.string().trim().max(100),
    phone: Joi.string().trim().max(20).allow(null, ''),
    avatar: Joi.string().uri().allow(null, ''),
}).unknown(false)

/**
 * Generic validation function
 */
export function validate<T>(
    data: unknown,
    schema: Joi.ObjectSchema,
): { value: T; error: null } | { value: null; error: Joi.ValidationError } {
    const { value, error } = schema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
    })
    if (error) {
        return { value: null, error }
    }
    return { value: value as T, error: null }
}

/**
 * Sanitize user input to prevent NoSQL injection in MongoDB regex queries
 */
export function sanitizeRegexInput(input: string): string {
    if (!input || typeof input !== 'string') return ''
    // Escape special regex characters
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ── Strict validation (rejects unknown keys instead of stripping them) ─────────────

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateStrict<T>(
    data: unknown,
    schema: Joi.ObjectSchema,
): { value: T; error: null } | { value: null; error: Joi.ValidationError } {
    const { value, error } = schema.validate(data, { abortEarly: true, allowUnknown: false })
    if (error) return { value: null, error }
    return { value: value as T, error: null }
}

export function validationMessage(error: Joi.ValidationError): string {
    return error.details[0]?.message.replace(/"/g, '') ?? 'Invalid request'
}

// ── Categories ─────────────────────────────────────────────────────────────────

const categoryFields = {
    name: Joi.string().trim().min(1).max(CATEGORY_LIMITS.nameMaxLength),
    hint: Joi.string().trim().allow('').max(CATEGORY_LIMITS.hintMaxLength),
    icon: Joi.string().valid(...CATEGORY_ICONS),
    color: Joi.string().valid(...CATEGORY_COLORS),
}

export const categorySchemas = {
    create: Joi.object({ ...categoryFields, name: categoryFields.name.required() }).unknown(false),
    patch: Joi.object({ ...categoryFields, isArchived: Joi.boolean() }).min(1).unknown(false),
}

export const reorderCategoriesSchema = Joi.object({
    ids: Joi.array().items(Joi.string().trim()).min(1).max(CATEGORY_LIMITS.max).unique().required(),
}).unknown(false)

// ── Worries ────────────────────────────────────────────────────────────────────

const worryFields = {
    categoryId: Joi.string().trim().length(24).hex(),
    description: Joi.string().trim().min(1).max(WORRY_LIMITS.descriptionMaxLength),
    isAnxiety: Joi.boolean(),
    isDepression: Joi.boolean(),
    intensity: Joi.number().integer().min(WORRY_LIMITS.intensityMin).max(WORRY_LIMITS.intensityMax),
    control: Joi.string().valid(...WORRY_CONTROLS),
    status: Joi.string().valid(...WORRY_STATUSES),
    nextStep: Joi.string().trim().allow('').max(WORRY_LIMITS.nextStepMaxLength),
    reframe: Joi.string().trim().allow('').max(WORRY_LIMITS.reframeMaxLength),
    notes: Joi.string().trim().allow('').max(WORRY_LIMITS.notesMaxLength),
    tags: Joi.array().items(Joi.string().trim().max(WORRY_LIMITS.tagMaxLength)).max(WORRY_LIMITS.tagsMax),
}

export const worrySchemas = {
    create: Joi.object({
        ...worryFields,
        categoryId: worryFields.categoryId.required(),
        description: worryFields.description.required(),
        isAnxiety: worryFields.isAnxiety.required(),
        isDepression: worryFields.isDepression.required(),
        intensity: worryFields.intensity.required(),
    })
        .custom((v, helpers) => (v.isAnxiety || v.isDepression ? v : helpers.message({ custom: 'Choose anxiety, depression, or both.' })))
        .unknown(false),
    patch: Joi.object(worryFields).min(1).unknown(false),
}

export const worrySimilarSchema = Joi.object({
    description: worryFields.description.required(),
    excludeId: Joi.string().trim().length(24).hex(),
}).unknown(false)

export const worryListQuerySchema = Joi.object({
    categoryId: Joi.string().trim().allow(''),
    type: Joi.string().valid(...WORRY_TYPES).allow(''),
    status: Joi.string().trim().allow('').max(60),
    control: Joi.string().valid(...WORRY_CONTROLS).allow(''),
    sort: Joi.string().valid(...WORRY_SORTS).allow(''),
    page: Joi.number().integer().min(1).max(10000),
}).unknown(false)
