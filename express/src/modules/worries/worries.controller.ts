import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { WORRY_LIMITS, WORRY_STATUSES } from '../../utils/domainConstants'
import { decryptField, encryptField } from '../../utils/fieldCrypto'
import { isObjectId, toIso } from '../../utils/serialize'
import { prepareText, similarity, SIMILARITY_THRESHOLD } from '../../utils/similarity'
import {
    validateStrict,
    validationMessage,
    worryListQuerySchema,
    worrySchemas,
    worrySimilarSchema,
} from '../../utils/validators'
import { Category } from '../categories/categories.model'

import { Worry } from './worries.model'

import type {
    WorryCreateInput,
    WorryDto,
    WorryDuplicateGroupDto,
    WorryMatchDto,
    WorrySimilarInput,
    WorryListQuery,
    WorryPatchInput,
    WorryStatus,
    WorrySummaryDto,
} from '@shared/dtos'

const NOT_FOUND = 'Entry not found'
const ENCRYPTED = ['description', 'nextStep', 'reframe', 'notes'] as const

export function toWorryDto(doc: any): WorryDto {
    return {
        id: String(doc._id),
        categoryId: String(doc.categoryId),
        description: decryptField(doc.description),
        isAnxiety: Boolean(doc.isAnxiety),
        isDepression: Boolean(doc.isDepression),
        intensity: Number(doc.intensity ?? 1),
        control: doc.control ?? 'partly',
        status: doc.status ?? 'active',
        nextStep: decryptField(doc.nextStep),
        reframe: decryptField(doc.reframe),
        notes: decryptField(doc.notes),
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        createdAt: toIso(doc.createdAt),
        updatedAt: toIso(doc.updatedAt),
        resolvedAt: toIso(doc.resolvedAt),
    }
}

/** Encrypt the private text fields of a validated body in place. */
function encryptBody<T extends Partial<WorryCreateInput>>(body: T): T {
    const out: Record<string, unknown> = { ...body }
    for (const key of ENCRYPTED) {
        if (typeof out[key] === 'string') out[key] = encryptField(out[key] as string)
    }
    if (Array.isArray(out.tags)) {
        out.tags = Array.from(new Set((out.tags as string[]).map((t) => t.trim().toLowerCase()).filter(Boolean)))
    }
    return out as T
}

async function ownsCategory(userId: string, categoryId: string) {
    return isObjectId(categoryId) && (await Category.exists({ _id: categoryId, userId })) !== null
}

// GET /api/worries?categoryId&type&status&control&sort&page
export async function listWorries(req: Request, res: Response) {
    const userId = req.userId!
    const { value, error } = validateStrict<WorryListQuery>(req.query, worryListQuerySchema)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    const filter: Record<string, unknown> = { userId }
    if (value.categoryId) {
        if (!isObjectId(value.categoryId)) {
            res.status(400).json({ error: 'Invalid category' })
            return
        }
        filter.categoryId = value.categoryId
    }
    if (value.type === 'anxiety') Object.assign(filter, { isAnxiety: true, isDepression: false })
    if (value.type === 'depression') Object.assign(filter, { isAnxiety: false, isDepression: true })
    if (value.type === 'both') Object.assign(filter, { isAnxiety: true, isDepression: true })
    if (value.status) {
        const statuses = value.status.split(',').filter((s): s is WorryStatus => (WORRY_STATUSES as readonly string[]).includes(s))
        if (statuses.length) filter.status = { $in: statuses }
    }
    if (value.control) filter.control = value.control

    const sort: Record<string, 1 | -1> =
        value.sort === 'oldest' ? { createdAt: 1 } : value.sort === 'intensity' ? { intensity: -1, createdAt: -1 } : { createdAt: -1 }
    const pageSize = WORRY_LIMITS.pageSize
    const page = Math.max(1, Number(value.page ?? 1))

    const [docs, total] = await Promise.all([
        Worry.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
        Worry.countDocuments(filter),
    ])
    res.json({ worries: docs.map(toWorryDto), total, page, pageSize })
}

// GET /api/worries/summary
export async function getWorrySummary(req: Request, res: Response) {
    const userId = new mongoose.Types.ObjectId(req.userId!)
    const rows = await Worry.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 }, intensitySum: { $sum: '$intensity' } } },
    ])
    const by = Object.fromEntries(rows.map((r) => [r._id, r])) as Record<string, { count: number; intensitySum: number }>
    const openCount = (by.active?.count ?? 0) + (by.improving?.count ?? 0)
    const openSum = (by.active?.intensitySum ?? 0) + (by.improving?.intensitySum ?? 0)
    const summary: WorrySummaryDto = {
        active: by.active?.count ?? 0,
        improving: by.improving?.count ?? 0,
        resolved: by.resolved?.count ?? 0,
        avgOpenIntensity: openCount ? Math.round((openSum / openCount) * 10) / 10 : 0,
    }
    res.json({ summary })
}

// GET /api/worries/:id
export async function getWorry(req: Request, res: Response) {
    if (!isObjectId(req.params.id)) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    const doc = await Worry.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!doc) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    res.json({ worry: toWorryDto(doc) })
}

// POST /api/worries
export async function createWorry(req: Request, res: Response) {
    const userId = req.userId!
    const { value, error } = validateStrict<WorryCreateInput>(req.body, worrySchemas.create)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    if (!(await ownsCategory(userId, value.categoryId))) {
        res.status(400).json({ error: 'Pick one of your categories.' })
        return
    }
    const status = value.status ?? 'active'
    const created = await Worry.create({
        ...encryptBody(value),
        userId,
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
    })
    res.status(201).json({ worry: toWorryDto(created) })
}

// PATCH /api/worries/:id
export async function updateWorry(req: Request, res: Response) {
    const userId = req.userId!
    if (!isObjectId(req.params.id)) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    const { value, error } = validateStrict<WorryPatchInput>(req.body, worrySchemas.patch)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    const doc = await Worry.findOne({ _id: req.params.id, userId })
    if (!doc) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    if (value.categoryId && !(await ownsCategory(userId, value.categoryId))) {
        res.status(400).json({ error: 'Pick one of your categories.' })
        return
    }
    const nextAnx = value.isAnxiety ?? doc.isAnxiety
    const nextDep = value.isDepression ?? doc.isDepression
    if (!nextAnx && !nextDep) {
        res.status(400).json({ error: 'Choose anxiety, depression, or both.' })
        return
    }
    if (value.status && value.status !== doc.status) {
        doc.resolvedAt = value.status === 'resolved' ? new Date() : null
    }
    doc.set(encryptBody(value))
    await doc.save()
    res.json({ worry: toWorryDto(doc) })
}

// DELETE /api/worries/:id
export async function deleteWorry(req: Request, res: Response) {
    if (!isObjectId(req.params.id)) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    const deleted = await Worry.findOneAndDelete({ _id: req.params.id, userId: req.userId }).lean()
    if (!deleted) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    res.json({ ok: true })
}

// ── Duplicates ────────────────────────────────────────────────────────────────
// Descriptions are encrypted, so matching happens here, in memory, on one user's
// own worries. Entry text is never logged.

const SIMILAR_MAX_RESULTS = 3
const DUPLICATE_SCAN_MAX = 2000

async function loadPrepared(userId: string) {
    const docs = await Worry.find({ userId }).sort({ createdAt: -1 }).limit(DUPLICATE_SCAN_MAX).lean()
    return docs.map((doc) => {
        const worry = toWorryDto(doc)
        return { worry, text: prepareText(worry.description) }
    })
}

const isOpen = (w: WorryDto) => w.status !== 'resolved'

// POST /api/worries/similar  { description, excludeId? }
export async function findSimilarWorries(req: Request, res: Response) {
    const { value, error } = validateStrict<WorrySimilarInput>(req.body, worrySimilarSchema)
    if (error) {
        res.status(400).json({ error: validationMessage(error) })
        return
    }
    const target = prepareText(value.description)
    const matches: WorryMatchDto[] = (await loadPrepared(req.userId!))
        .filter(({ worry }) => worry.id !== value.excludeId)
        .map(({ worry, text }) => ({ worry, score: Math.round(similarity(target, text) * 100) / 100 }))
        .filter((m) => m.score >= SIMILARITY_THRESHOLD)
        // Open worries first (the real "already on my list" case), then closest match
        .sort((a, b) => Number(isOpen(b.worry)) - Number(isOpen(a.worry)) || b.score - a.score)
        .slice(0, SIMILAR_MAX_RESULTS)
    res.json({ matches })
}

// GET /api/worries/duplicates
export async function findDuplicateWorries(req: Request, res: Response) {
    const items = await loadPrepared(req.userId!)
    const parent = items.map((_, i) => i)
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
    const pairs: Array<[number, number, number]> = []

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const score = similarity(items[i].text, items[j].text)
            if (score < SIMILARITY_THRESHOLD) continue
            pairs.push([i, j, score])
            const [a, b] = [find(i), find(j)]
            if (a !== b) parent[b] = a
        }
    }
    const best = new Map<number, number>()
    for (const [i, , score] of pairs) best.set(find(i), Math.max(best.get(find(i)) ?? 0, score))

    const byRoot = new Map<number, WorryDto[]>()
    items.forEach(({ worry }, i) => {
        const root = find(i)
        byRoot.set(root, [...(byRoot.get(root) ?? []), worry])
    })
    const groups: WorryDuplicateGroupDto[] = [...byRoot.entries()]
        .filter(([, worries]) => worries.length > 1)
        .map(([root, worries]) => ({ worries, score: Math.round((best.get(root) ?? 0) * 100) / 100 }))
        .sort((a, b) => b.score - a.score)
    res.json({ groups })
}
