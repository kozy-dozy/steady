import jwt from 'jsonwebtoken'

import type { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token

    if (!token) {
        res.status(401).json({ error: 'Unauthorized: No token' })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
            algorithms: ['HS256'],
        }) as {
            id: string
        }
        req.userId = decoded.id
        next()
    } catch (err: any) {
        const msg =
            err.name === 'TokenExpiredError'
                ? 'Session expired, please log in again.'
                : 'Unauthorized: Invalid token'
        res.status(401).json({ error: msg })
    }
}
