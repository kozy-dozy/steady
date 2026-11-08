import { Category } from './categories.model'

import type { CategoryIcon } from '@shared/dtos'

/** The starter list from the spec. Created once per user; editable afterwards. */
export const DEFAULT_CATEGORIES: { slug: string; name: string; hint: string; icon: CategoryIcon; color: string }[] = [
    { slug: 'work-career', name: 'Work / Career', hint: 'job, reviews, tech moving fast', icon: 'LuBriefcase', color: '#2C6170' },
    { slug: 'money-finances', name: 'Money / Finances', hint: 'mortgage, debt, 401(k)', icon: 'LuWallet', color: '#5B6F94' },
    { slug: 'kids-parenting', name: 'Kids / Parenting', hint: 'driving, college, social media', icon: 'LuBaby', color: '#3E7A6B' },
    { slug: 'partner-relationships', name: 'Partner / Relationships', hint: 'communication, conflict, distance', icon: 'LuHeart', color: '#8A5A6B' },
    { slug: 'family', name: 'Family', hint: 'aging parents, siblings, caregiving', icon: 'LuUsers', color: '#6B5B94' },
    { slug: 'health-body', name: 'Health / Body', hint: 'sleep, weight, energy', icon: 'LuActivity', color: '#3F7A8C' },
    { slug: 'future-aging', name: 'Future / Aging', hint: 'retirement, purpose, direction', icon: 'LuCompass', color: '#6B6A3E' },
    { slug: 'home', name: 'Home', hint: 'repairs, maintenance, chores', icon: 'LuHouse', color: '#7A5A3E' },
    { slug: 'social-friends', name: 'Social / Friends', hint: 'loneliness, staying in touch', icon: 'LuMessageCircle', color: '#3E6B7A' },
    { slug: 'self-identity', name: 'Self / Identity', hint: 'self-worth, regrets, comparing', icon: 'LuUser', color: '#5E4E73' },
    { slug: 'world-news', name: 'World / News', hint: 'politics, economy, AI', icon: 'LuGlobe', color: '#556A70' },
    { slug: 'other', name: 'Other', hint: 'catch-all', icon: 'LuCircleDot', color: '#6F7F84' },
]

/** Give a user the starter categories the first time they have none. Idempotent. */
export async function ensureDefaultCategories(userId: string): Promise<void> {
    const count = await Category.countDocuments({ userId })
    if (count > 0) return
    await Category.insertMany(
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, userId, sortOrder: i, isDefault: c.slug === 'other' })),
        { ordered: false },
    ).catch((err) => {
        // A parallel request may have inserted them first
        if (err?.code !== 11000) throw err
    })
}
