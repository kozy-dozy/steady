import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { isObjectId, slugify, toIso } from '../../utils/serialize'
import {
    categorySchemas,
    reorderCategoriesSchema,
    validateStrict,
    validationMessage,
} from '../../utils/validators'
import { Worry } from '../worries/worries.model'

import { Category } from './categories.model'
import { ensureDefaultCategories } from './defaultCategories'

import type { CategoryCreateInput, CategoryDto, CategoryPatchInput, CategoryReorderInput } from '@shared/dtos'

const NOT_FOUND = 'Category not found'
const DUPLICATE = 'You already have a category with that name.'
const isDuplicateKey = (err: any) => err?.code === 11000

export function toCategoryDto(doc: any, worryCount = 0): CategoryDto {
    return {
        id: String(doc._id),
        slug: doc.slug ?? '',
        name: doc.name ?? '',
        hint: doc.hint ?? '',
        icon: doc.icon ?? 'LuCircleDot',
        color: doc.color ?? '#556A70',
        sortOrder: Number(doc.sortOrder ?? 0),
        isArchived: Boolean(doc.isArchived),
        isDefault: Boolean(doc.isDefault),
        worryCount,
        createdAt: toIso(doc.createdAt),
        updatedAt: toIso(doc.updatedAt),
    }
}

async function countsByCategory(userId: string): Promise<Map<string, number>> {
    const rows = await Worry.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ])
    return new Map(rows.map((r) => [String(r._id), Number(r.count)]))
}

// GET /api/categories?includeArchived=1
export async function listCategories(req: Request, res: Response) {
    const userId = req.userId!
    await ensureDefaultCategories(userId)
    const filter: Record<string, unknown> = { userId }
    if (req.query.includeArchived !== '1') filter.isArchived = false
    const [docs, counts] = await Promise.all([
        Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean(),
        countsByCategory(userId),
    ])
    res.json({ categories: docs.map((d) => toCategoryDto(d, counts.get(String(d._id)) ?? 0)) })
}

// POST /api/categories
export async function createCategory(req: Request, res: Response) {
    const userId = req.userId!
    const { value, error } = validateStrict<CategoryCreateInput>(req.body, categorySchemas.create)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    const slug = slugify(value.name)
    if (!slug) {
        res.status(400).json({ error: 'Use at least one letter or number in the name.' })
        return
    }
    const last = await Category.findOne({ userId }).sort({ sortOrder: -1 }).lean()
    try {
        const created = await Category.create({ ...value, slug, userId, sortOrder: (last?.sortOrder ?? -1) + 1 })
        res.status(201).json({ category: toCategoryDto(created) })
    } catch (err) {
        if (isDuplicateKey(err)) {
            res.status(409).json({ error: DUPLICATE })
            return
        }
        throw err
    }
}

// PATCH /api/categories/:id
export async function updateCategory(req: Request, res: Response) {
    const userId = req.userId!
    if (!isObjectId(req.params.id)) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    const { value, error } = validateStrict<CategoryPatchInput>(req.body, categorySchemas.patch)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    const doc = await Category.findOne({ _id: req.params.id, userId })
    if (!doc) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    if (doc.isDefault && value.isArchived) {
        res.status(400).json({ error: '"Other" is the catch-all and can\'t be archived.' })
        return
    }
    if (value.name !== undefined) {
        doc.name = value.name
        doc.slug = slugify(value.name)
    }
    if (value.hint !== undefined) doc.hint = value.hint
    if (value.icon !== undefined) doc.icon = value.icon
    if (value.color !== undefined) doc.color = value.color
    if (value.isArchived !== undefined) doc.isArchived = value.isArchived
    try {
        await doc.save()
        const counts = await countsByCategory(userId)
        res.json({ category: toCategoryDto(doc, counts.get(String(doc._id)) ?? 0) })
    } catch (err) {
        if (isDuplicateKey(err)) {
            res.status(409).json({ error: DUPLICATE })
            return
        }
        throw err
    }
}

// PATCH /api/categories/reorder  { ids }
export async function reorderCategories(req: Request, res: Response) {
    const userId = req.userId!
    const { value, error } = validateStrict<CategoryReorderInput>(req.body, reorderCategoriesSchema)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    if (!value.ids.every(isObjectId)) {
        res.status(400).json({ error: 'Invalid category id' })
        return
    }
    const owner = new mongoose.Types.ObjectId(userId)
    await Category.bulkWrite(
        value.ids.map((id, i) => ({
            updateOne: { filter: { _id: new mongoose.Types.ObjectId(id), userId: owner }, update: { $set: { sortOrder: i } } },
        })),
    )
    res.json({ ok: true })
}
