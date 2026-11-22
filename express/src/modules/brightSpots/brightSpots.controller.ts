import { Request, Response } from 'express'

import { BRIGHT_SPOT_LIMITS } from '../../utils/domainConstants'
import { decryptField, encryptField } from '../../utils/fieldCrypto'
import { isObjectId, toIso } from '../../utils/serialize'
import { brightSpotImageSchema, brightSpotSchema, validateStrict, validationMessage } from '../../utils/validators'

import { BrightSpot, BrightSpotImage } from './brightSpots.model'

import type { BrightSpotDto, BrightSpotImageInput, BrightSpotImageResponse, BrightSpotInput } from '@shared/dtos'

const NOT_FOUND = 'Bright spot not found'
const NO_IMAGE = 'No photo for this bright spot'

export function toBrightSpotDto(doc: any): BrightSpotDto {
    return {
        id: String(doc._id),
        text: decryptField(doc.text),
        image: doc.image ? { width: doc.image.width, height: doc.image.height, updatedAt: toIso(doc.image.updatedAt) } : null,
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
    await BrightSpotImage.deleteOne({ spotId: deleted._id, userId: req.userId })
    res.json({ ok: true })
}

// ── Photo (optional, one per bright spot) ─────────────────────────────────────

/** Check the bytes really are the image type claimed (first bytes of the file). */
function looksLike(mime: string, buf: Buffer) {
    if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
    if (mime === 'image/png') return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    if (mime === 'image/webp') return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP'
    return false
}

const findOwned = (req: Request) =>
    isObjectId(req.params.id) ? BrightSpot.findOne({ _id: req.params.id, userId: req.userId }) : Promise.resolve(null)

// PUT /api/bright-spots/:id/image  { mime, data (base64), width, height }
export async function putBrightSpotImage(req: Request, res: Response) {
    const { value, error } = validateStrict<BrightSpotImageInput>(req.body, brightSpotImageSchema)
    if (error) {
        res.status(400).json({ error: 'That photo could not be used. Try a JPEG or PNG.' })
        return
    }
    const buf = Buffer.from(value.data, 'base64')
    if (buf.length > BRIGHT_SPOT_LIMITS.imageMaxBytes || !looksLike(value.mime, buf)) {
        res.status(400).json({ error: 'That photo could not be used. Try a JPEG or PNG.' })
        return
    }
    const doc = await findOwned(req)
    if (!doc) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    await BrightSpotImage.findOneAndUpdate(
        { spotId: doc._id, userId: req.userId },
        { mime: value.mime, data: encryptField(value.data) },
        { upsert: true },
    )
    doc.set('image', { width: value.width, height: value.height, updatedAt: new Date() })
    await doc.save()
    res.json({ brightSpot: toBrightSpotDto(doc) })
}

// GET /api/bright-spots/:id/image
export async function getBrightSpotImage(req: Request, res: Response) {
    const img = isObjectId(req.params.id) ? await BrightSpotImage.findOne({ spotId: req.params.id, userId: req.userId }).lean() : null
    if (!img) {
        res.status(404).json({ error: NO_IMAGE })
        return
    }
    res.set('Cache-Control', 'private, no-store')
    const body: BrightSpotImageResponse = { mime: img.mime as BrightSpotImageResponse['mime'], data: decryptField(img.data) }
    res.json(body)
}

// DELETE /api/bright-spots/:id/image
export async function deleteBrightSpotImage(req: Request, res: Response) {
    const doc = await findOwned(req)
    if (!doc) {
        res.status(404).json({ error: NOT_FOUND })
        return
    }
    await BrightSpotImage.deleteOne({ spotId: doc._id, userId: req.userId })
    doc.set('image', null)
    await doc.save()
    res.json({ brightSpot: toBrightSpotDto(doc) })
}
