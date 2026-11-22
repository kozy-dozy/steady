import { Request, Response } from 'express'

import { BRIGHT_SPOT_LIMITS } from '../../utils/domainConstants'
import { decryptField, encryptField } from '../../utils/fieldCrypto'
import { isObjectId, toIso } from '../../utils/serialize'
import { brightSpotSchema, validateStrict, validationMessage } from '../../utils/validators'

import { BrightSpot } from './brightSpots.model'

import type { BrightSpotDto, BrightSpotInput } from '@shared/dtos'

const NOT_FOUND = 'Bright spot not found'

export function toBrightSpotDto(doc: any): BrightSpotDto {
    return {
        id: String(doc._id),
        text: decryptField(doc.text),
        createdAt: toIso(doc.createdAt),
        updatedAt: toIso(doc.updatedAt),
    }
}

function readBody(req: Request, res: Response) {
    const { value, error } = validateStrict<BrightSpotInput>(req.body, brightSpotSchema)
    if (error) res.status(400).json({ error: validationMessage(error) })
    return error ? null : value
}

// GET /api/bright-spots  (newest first)
export async function listBrightSpots(req: Request, res: Response) {
    const docs = await BrightSpot.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(BRIGHT_SPOT_LIMITS.max).lean()
    res.json({ brightSpots: docs.map(toBrightSpotDto) })
}

// POST /api/bright-spots  { text }
export async function createBrightSpot(req: Request, res: Response) {
    const value = readBody(req, res)
    if (!value) return
    if ((await BrightSpot.countDocuments({ userId: req.userId })) >= BRIGHT_SPOT_LIMITS.max) {
        res.status(409).json({ error: `You can keep up to ${BRIGHT_SPOT_LIMITS.max} bright spots.` })
        return
    }
    const created = await BrightSpot.create({ userId: req.userId, text: encryptField(value.text) })
    res.status(201).json({ brightSpot: toBrightSpotDto(created) })
}

// PATCH /api/bright-spots/:id  { text }
export async function updateBrightSpot(req: Request, res: Response) {
    const value = readBody(req, res)
    if (!value) return
    const doc = isObjectId(req.params.id) ? await BrightSpot.findOne({ _id: req.params.id, userId: req.userId }) : null
    if (!doc) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    doc.text = encryptField(value.text)
    await doc.save()
    res.json({ brightSpot: toBrightSpotDto(doc) })
}

// DELETE /api/bright-spots/:id
export async function deleteBrightSpot(req: Request, res: Response) {
    const deleted = isObjectId(req.params.id)
        ? await BrightSpot.findOneAndDelete({ _id: req.params.id, userId: req.userId }).lean()
        : null
    if (!deleted) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    res.json({ ok: true })
}
