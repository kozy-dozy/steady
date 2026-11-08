/** Categories: the owner's buckets for sorting worries (stored per user, editable). */

export const CATEGORY_LIMITS = {
    nameMaxLength: 40,
    hintMaxLength: 80,
    max: 40,
} as const

/** Lucide icon names (react-icons/lu) a category may use. */
export const CATEGORY_ICONS = [
    'LuBriefcase',
    'LuWallet',
    'LuBaby',
    'LuHeart',
    'LuUsers',
    'LuActivity',
    'LuCompass',
    'LuHouse',
    'LuMessageCircle',
    'LuUser',
    'LuGlobe',
    'LuCircleDot',
    'LuCar',
    'LuGraduationCap',
    'LuSun',
    'LuMoon',
] as const
export type CategoryIcon = (typeof CATEGORY_ICONS)[number]

/** Calm swatches; each passes AA as a dot/border on white and takes dark text on its tint. */
export const CATEGORY_COLORS = [
    '#2C6170',
    '#5B6F94',
    '#3E7A6B',
    '#8A5A6B',
    '#6B5B94',
    '#3F7A8C',
    '#6B6A3E',
    '#7A5A3E',
    '#3E6B7A',
    '#5E4E73',
    '#556A70',
    '#6F7F84',
] as const

export interface CategoryDto {
    id: string
    slug: string
    name: string
    hint: string
    icon: CategoryIcon
    color: string
    sortOrder: number
    isArchived: boolean
    /** The catch-all "Other" category: can't be archived or deleted. */
    isDefault: boolean
    /** Number of worries in this category (any status). */
    worryCount: number
    createdAt: string
    updatedAt: string
}

export interface CategoryCreateInput {
    name: string
    hint?: string
    icon?: CategoryIcon
    color?: string
}

export type CategoryPatchInput = Partial<CategoryCreateInput> & { isArchived?: boolean }

export interface CategoryReorderInput {
    /** Category ids in their new order. */
    ids: string[]
}
