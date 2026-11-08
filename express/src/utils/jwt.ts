import jwt from 'jsonwebtoken'

type JwtPayload = { id: string }

function requireEnv(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
    const v = process.env[name]
    if (!v)
        throw new Error(
            `${name} is missing. Check your .env and restart the server.`,
        )
    return v
}

export function generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, requireEnv('JWT_SECRET'), {
        expiresIn: '2h',
        algorithm: 'HS256',
    })
}

export function generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, requireEnv('JWT_REFRESH_SECRET'), {
        expiresIn: '2d',
        algorithm: 'HS256',
    })
}

export function verifyToken(token: string) {
    return jwt.verify(token, requireEnv('JWT_SECRET'), {
        algorithms: ['HS256'],
    })
}
