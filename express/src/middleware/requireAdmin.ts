import Member from '../modules/members/members.model'

import type { Request, Response, NextFunction } from 'express'

export async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const userId = req.userId

    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const member = await Member.findById(userId)

    if (!member || !member.authority?.includes('admin')) {
        res.status(403).json({ error: 'Admin access required' })
        return
    }

    next()
}
