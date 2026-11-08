import { Request, Response } from 'express'

import Member from '../members/members.model'
import { Worry } from '../worries/worries.model'

// GET /admin/dashboard: account-level counts (no private text)
export async function getAdminDashboard(_req: Request, res: Response) {
    const [membersTotal, worriesTotal] = await Promise.all([Member.countDocuments({}), Worry.countDocuments({})])
    res.json({ stats: { membersTotal, worriesTotal } })
}
