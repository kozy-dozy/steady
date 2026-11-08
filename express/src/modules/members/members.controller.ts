import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'

import { sanitizeRegexInput } from '../../utils/validators'

import Member from './members.model'

import type { MemberDto } from '@shared/dtos'

function toMemberDto(member: any): MemberDto {
    return {
        id: member.id ?? member._id?.toString(),
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        emailVerified: member.emailVerified,
        authority: member.authority,
        role: member.role ?? 'family',
        avatar: member.avatar ?? '',
        createdAt: member.createdAt?.toISOString(),
        phone: member.phone || '',
    }
}

// POST /members with paging, sorting, filtering
export async function getMembers(req: Request, res: Response) {
    const {
        pageIndex = 1,
        pageSize = 10,
        query = '',
        sort = { order: '', key: '' },
        filterData,
    } = req.body ?? {}

    const page = Number(pageIndex) || 1
    const limit = Number(pageSize) || 10
    const skip = (page - 1) * limit

    const mongoFilter: any = {}

    // 🔍 Global search - SANITIZE TO PREVENT NoSQL INJECTION
    if (query && String(query).trim().length > 0) {
        const q = sanitizeRegexInput(String(query).trim())
        mongoFilter.$or = [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
        ]
    }

    if (filterData?.authority?.length) {
        mongoFilter.authority = { $in: filterData.authority }
    }

    if (filterData?.emailVerified?.length) {
        mongoFilter.emailVerified = { $in: filterData.emailVerified }
    }

    const sortKey = sort?.key
    const sortOrder = sort?.order === 'desc' ? -1 : 1

    const mongoSort: any = {}
    if (sortKey) {
        mongoSort[String(sortKey)] = sortOrder
    } else {
        mongoSort.createdAt = -1
    }

    const [total, members] = await Promise.all([
        Member.countDocuments(mongoFilter),
        Member.find(mongoFilter).sort(mongoSort).skip(skip).limit(limit),
    ])

    const data: MemberDto[] = members.map(toMemberDto)

    res.json({ data, total })
}

// GET /members/:id
export async function getMemberById(req: Request, res: Response) {
    const member = await Member.findById(req.params.id)
    if (!member) {
        res.status(404).json({ error: 'Account not found' })
        return
    }

    res.json(toMemberDto(member))
}

// PUT /members/:id
export async function updateMemberById(req: Request, res: Response) {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!member) {
        res.status(404).json({ error: 'Account not found' })
        return
    }

    res.json(toMemberDto(member))
}

// DELETE /members/:id
export async function deleteMemberById(req: Request, res: Response) {
    const deleted = await Member.findByIdAndDelete(req.params.id)
    if (!deleted) {
        res.status(404).json({ error: 'Account not found' })
        return
    }

    res.json({ message: 'Member deleted' })
}

// GET /members/me
export async function getMe(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const member = await Member.findById(userId)
    if (!member) {
        res.status(404).json({ error: 'Account not found' })
        return
    }

    res.status(200).json({ member: toMemberDto(member) })
}

// PATCH /members/me
export async function updateMe(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const { firstName, lastName, avatar, phone } = req.body as any

    const update: any = {}
    if (typeof firstName === 'string') update.firstName = firstName
    if (typeof lastName === 'string') update.lastName = lastName
    if (typeof avatar === 'string') update.avatar = avatar
    if (typeof phone === 'string') update.phone = phone

    const member = await Member.findByIdAndUpdate(userId, update, {
        new: true,
        runValidators: true,
    })

    if (!member) {
        res.status(404).json({ error: 'Account not found' })
        return
    }

    res.status(200).json({ member: toMemberDto(member) })
}

// POST /members/me/password
export async function updateMyPassword(req: Request, res: Response) {
    const userId = req.userId
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const { password, newPassword } = req.body as {
        password?: string
        newPassword?: string
    }

    if (!password || !newPassword) {
        res.status(400).json({
            error: 'Current password and new password are required',
        })
        return
    }

    const strong =
        newPassword.length >= 8 &&
        /[0-9]/.test(newPassword) &&
        /[^A-Za-z0-9]/.test(newPassword)

    if (!strong) {
        res.status(400).json({
            error: 'Password must be at least 8 characters and include at least one number and one special character.',
        })
        return
    }

    const member = await Member.findById(userId)
    if (!member) {
        res.status(404).json({ error: 'Account not found' })
        return
    }

    const ok = await bcrypt.compare(password, member.password)
    if (!ok) {
        res.status(400).json({ error: 'Current password is incorrect' })
        return
    }

    const same = await bcrypt.compare(newPassword, member.password)
    if (same) {
        res.status(400).json({ error: 'New password must be different' })
        return
    }

    member.password = await bcrypt.hash(newPassword, 12)
    await member.save()

    res.status(200).json({ message: 'Password updated' })
}
