import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'

const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), 'backend'),
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '..', '..'),
]

function findFile(file: string) {
    for (const base of candidates) {
        const p = path.resolve(base, file)
        if (fs.existsSync(p)) return p
    }
    return null
}

const isProduction = process.env.NODE_ENV === 'production'

const baseEnvPath = findFile('.env')

if (baseEnvPath) {
    dotenv.config({ path: baseEnvPath })
} else if (!isProduction) {
    throw new Error('Could not find .env')
}

const override =
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'

const overridePath = findFile(override)

if (overridePath) dotenv.config({ path: overridePath, override: true })
