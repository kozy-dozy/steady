import mongoose from 'mongoose'

import Member from '../members.model'

import type { Request, Response } from 'express'

type AuthedRequest = Request & { userId?: string }

const normalizeStr = (v: unknown) => String(v ?? '').trim().toLowerCase()

const normalizeAddrKey = (a: {
    line1?: unknown
    line2?: unknown
    city?: unknown
    state?: unknown
    zip?: unknown
    country?: unknown
}) =>
    [
        normalizeStr(a.line1),
        normalizeStr(a.line2),
        normalizeStr(a.city),
        String(a.state ?? '').trim().toUpperCase(),
        normalizeStr(a.zip),
        String(a.country ?? 'US').trim().toUpperCase(),
    ].join('|')

const findDuplicate = (list: any[], candidate: any) => {
    const key = normalizeAddrKey(candidate)
    return list.find((a) => normalizeAddrKey(a) === key) ?? null
}

const validateAddress = (body: any) => {
    const errors: string[] = []
    const line1 = String(body?.line1 ?? '').trim()
    const city = String(body?.city ?? '').trim()
    const state = String(body?.state ?? '').trim().toUpperCase()
    const zip = String(body?.zip ?? '').trim()

    if (!line1) errors.push('line1 is required')
    if (!city) errors.push('city is required')
    if (!state || state.length !== 2) errors.push('state must be 2 letters')
    if (!zip) errors.push('zip is required')

    return {
        ok: errors.length === 0,
        errors,
        value: {
            line1,
            line2: String(body?.line2 ?? '').trim(),
            city,
            state,
            zip,
            country: String(body?.country ?? 'US').trim().toUpperCase() || 'US',
            instructions: String(body?.instructions ?? '').trim(),
        },
    }
}

const mapAddress = (a: any) => ({
    id: String(a._id),
    label: a.label ?? '',
    line1: a.line1,
    line2: a.line2 ?? '',
    city: a.city,
    state: a.state,
    zip: a.zip,
    country: a.country ?? 'US',
    instructions: a.instructions ?? '',
    isDefault: !!a.isDefault,
})

const toPublicShipping = (member: any) => ({
    shippingAddresses: (member.shippingAddresses ?? []).map(mapAddress),
    defaultShippingAddressId: member.defaultShippingAddressId
        ? String(member.defaultShippingAddressId)
        : null,
})

const toPublicBilling = (member: any) => ({
    billingAddresses: (member.billingAddresses ?? []).map(mapAddress),
    defaultBillingAddressId: member.defaultBillingAddressId
        ? String(member.defaultBillingAddressId)
        : null,
})


export async function getShippingAddresses(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const member = await Member.findById(req.userId).select(
        'shippingAddresses defaultShippingAddressId',
    )
    if (!member) return res.status(404).json({ error: 'Member not found' })

    return res.json(toPublicShipping(member))
}

export async function addShippingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { ok, errors, value } = validateAddress(req.body)
    if (!ok) return res.status(400).json({ error: errors.join(', ') })

    const isDefault = Boolean(req.body?.isDefault)

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const dup = findDuplicate(member.shippingAddresses ?? [], value)
    if (dup) {
        if (isDefault) {
            member.defaultShippingAddressId = dup._id
            member.shippingAddresses.forEach((a: any) => {
                a.isDefault = String(a._id) === String(dup._id)
            })
            await member.save()
        }
        return res.status(409).json({
            error: 'That shipping address already exists.',
            ...toPublicShipping(member),
            existingAddressId: String(dup._id),
        })
    }

    member.shippingAddresses.push({
        ...value,
        label: String(req.body?.label ?? '').trim(),
        isDefault: false,
    } as any)

    const created = member.shippingAddresses[member.shippingAddresses.length - 1]
    const alreadyHasDefault = Boolean(member.defaultShippingAddressId)

    if (isDefault || !alreadyHasDefault) {
        member.defaultShippingAddressId = created._id
        member.shippingAddresses.forEach((a: any) => {
            a.isDefault = String(a._id) === String(created._id)
        })
    }

    await member.save()

    return res.status(201).json({
        ...toPublicShipping(member),
        createdAddressId: created?._id ? String(created._id) : undefined,
    })
}

export async function updateShippingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { addressId } = req.params
    if (!mongoose.isValidObjectId(addressId)) {
        return res.status(400).json({ error: 'Invalid addressId' })
    }

    const { ok, errors, value } = validateAddress(req.body)
    if (!ok) return res.status(400).json({ error: errors.join(', ') })

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const addr = member.shippingAddresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    const dup = (member.shippingAddresses ?? []).find((a: any) => {
        if (String(a._id) === String(addressId)) return false
        return normalizeAddrKey(a) === normalizeAddrKey(value)
    })
    if (dup) {
        return res.status(409).json({
            error: 'Another shipping address with those details already exists.',
            ...toPublicShipping(member),
            existingAddressId: String(dup._id),
        })
    }

    addr.set({
        ...value,
        label: String(req.body?.label ?? '').trim(),
        instructions: String(req.body?.instructions ?? '').trim(),
    })

    const isDefault =
        member.defaultShippingAddressId &&
        String(member.defaultShippingAddressId) === String(addr._id)
    ;(addr as any).isDefault = Boolean(isDefault)

    await member.save()
    return res.json(toPublicShipping(member))
}

export async function deleteShippingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { addressId } = req.params
    if (!mongoose.isValidObjectId(addressId)) {
        return res.status(400).json({ error: 'Invalid addressId' })
    }

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const addr = member.shippingAddresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    const wasDefault =
        member.defaultShippingAddressId &&
        String(member.defaultShippingAddressId) === String(addr._id)

    addr.deleteOne()

    if (wasDefault) {
        const next = member.shippingAddresses[0]
        member.defaultShippingAddressId = next ? next._id : null
        member.shippingAddresses.forEach((a: any) => {
            a.isDefault = next ? String(a._id) === String(next._id) : false
        })
    }

    await member.save()
    return res.json(toPublicShipping(member))
}

export async function setDefaultShippingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { addressId } = req.params
    if (!mongoose.isValidObjectId(addressId)) {
        return res.status(400).json({ error: 'Invalid addressId' })
    }

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const addr = member.shippingAddresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    member.defaultShippingAddressId = addr._id
    member.shippingAddresses.forEach((a: any) => {
        a.isDefault = String(a._id) === String(addr._id)
    })

    await member.save()
    return res.json(toPublicShipping(member))
}


export async function getBillingAddresses(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const member = await Member.findById(req.userId).select(
        'billingAddresses defaultBillingAddressId',
    )
    if (!member) return res.status(404).json({ error: 'Member not found' })

    return res.json(toPublicBilling(member))
}


export async function addBillingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { ok, errors, value } = validateAddress(req.body)
    if (!ok) return res.status(400).json({ error: errors.join(', ') })

    const isDefault = Boolean(req.body?.isDefault)

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const dup = findDuplicate(member.billingAddresses ?? [], value)
    if (dup) {
        if (isDefault) {
            member.defaultBillingAddressId = dup._id
            member.billingAddresses.forEach((a: any) => {
                a.isDefault = String(a._id) === String(dup._id)
            })
            await member.save()
        }
        return res.status(409).json({
            error: 'That billing address already exists.',
            ...toPublicBilling(member),
            existingAddressId: String(dup._id),
        })
    }

    member.billingAddresses.push({
        ...value,
        label: String(req.body?.label ?? '').trim(),
        isDefault: false,
    } as any)

    const created = member.billingAddresses[member.billingAddresses.length - 1]
    const alreadyHasDefault = Boolean(member.defaultBillingAddressId)

    if (isDefault || !alreadyHasDefault) {
        member.defaultBillingAddressId = created._id
        member.billingAddresses.forEach((a: any) => {
            a.isDefault = String(a._id) === String(created._id)
        })
    }

    await member.save()

    return res.status(201).json({
        ...toPublicBilling(member),
        createdAddressId: created?._id ? String(created._id) : undefined,
    })
}


export async function updateBillingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { addressId } = req.params
    if (!mongoose.isValidObjectId(addressId)) {
        return res.status(400).json({ error: 'Invalid addressId' })
    }

    const { ok, errors, value } = validateAddress(req.body)
    if (!ok) return res.status(400).json({ error: errors.join(', ') })

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const addr = member.billingAddresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    const dup = (member.billingAddresses ?? []).find((a: any) => {
        if (String(a._id) === String(addressId)) return false
        return normalizeAddrKey(a) === normalizeAddrKey(value)
    })
    if (dup) {
        return res.status(409).json({
            error: 'Another billing address with those details already exists.',
            ...toPublicBilling(member),
            existingAddressId: String(dup._id),
        })
    }

    addr.set({
        ...value,
        label: String(req.body?.label ?? '').trim(),
        instructions: String(req.body?.instructions ?? '').trim(),
    })

    const isDefault =
        member.defaultBillingAddressId &&
        String(member.defaultBillingAddressId) === String(addr._id)
    ;(addr as any).isDefault = Boolean(isDefault)

    await member.save()
    return res.json(toPublicBilling(member))
}


export async function deleteBillingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { addressId } = req.params
    if (!mongoose.isValidObjectId(addressId)) {
        return res.status(400).json({ error: 'Invalid addressId' })
    }

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const addr = member.billingAddresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    const wasDefault =
        member.defaultBillingAddressId &&
        String(member.defaultBillingAddressId) === String(addr._id)

    addr.deleteOne()

    if (wasDefault) {
        const next = member.billingAddresses[0]
        member.defaultBillingAddressId = next ? next._id : null
        member.billingAddresses.forEach((a: any) => {
            a.isDefault = next ? String(a._id) === String(next._id) : false
        })
    }

    await member.save()
    return res.json(toPublicBilling(member))
}


export async function setDefaultBillingAddress(req: AuthedRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const { addressId } = req.params
    if (!mongoose.isValidObjectId(addressId)) {
        return res.status(400).json({ error: 'Invalid addressId' })
    }

    const member = await Member.findById(req.userId)
    if (!member) return res.status(404).json({ error: 'Member not found' })

    const addr = member.billingAddresses.id(addressId)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    member.defaultBillingAddressId = addr._id
    member.billingAddresses.forEach((a: any) => {
        a.isDefault = String(a._id) === String(addr._id)
    })

    await member.save()
    return res.json(toPublicBilling(member))
}
