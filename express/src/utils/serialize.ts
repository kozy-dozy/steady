import mongoose from 'mongoose'

/** Date | string | undefined → ISO string ('' when missing). */
export function toIso(value: unknown): string {
    if (!value) return ''
    const d = value instanceof Date ? value : new Date(String(value))
    return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

export function isObjectId(id: unknown): id is string {
    return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id
}

/** Lower-case kebab slug from a display name. */
export function slugify(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/&/g, ' and ')
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
}
