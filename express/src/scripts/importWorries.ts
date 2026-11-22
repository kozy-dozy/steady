/**
 * Add your own worries from a JSON file. Add-only: never edits or deletes anything.
 *
 *   yarn workspace steady-express import:worries <email> [file]
 *   yarn workspace steady-express import:worries <email> [file] --dry-run   # show what would happen
 *
 * `file` defaults to `imports/worries.json` (inside express/). The `imports/` folder is gitignored,
 * because the repo is public and these are real entries. Format: see `imports.example.json`.
 *
 * - Rows are normal entries (`seeded: false`), so `seed --force` never removes them.
 * - A row is skipped when it matches a worry the account already has (same duplicate check as the
 *   app), or an earlier row in the same file. Running it twice adds nothing the second time.
 * - Text is encrypted like entries made in the app. Entry text is printed only to your terminal.
 */
import '../env'
import fs from 'fs'
import path from 'path'

import mongoose from 'mongoose'

import { Category } from '../modules/categories/categories.model'
import { ensureDefaultCategories } from '../modules/categories/defaultCategories'
import Member from '../modules/members/members.model'
import { Worry } from '../modules/worries/worries.model'
import { WORRY_CONTROLS, WORRY_LIMITS, WORRY_STATUSES } from '../utils/domainConstants'
import { decryptField, encryptField } from '../utils/fieldCrypto'
import { prepareText, similarity, SIMILARITY_THRESHOLD, type PreparedText } from '../utils/similarity'

type ImportRow = {
    description: string
    /** Category slug or name, e.g. "home" or "Home". Default: Other. */
    category?: string
    /** anxiety | depression | both. Default: anxiety. */
    type?: string
    /** 1..10. Default: 5. */
    intensity?: number
    /** yes | partly | no. Default: partly. */
    control?: string
    /** active | improving | resolved. Default: active. */
    status?: string
    nextStep?: string
    reframe?: string
    notes?: string
    tags?: string[]
}

const norm = (s: string) => s.trim().toLowerCase()

async function run() {
    const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
    const dryRun = process.argv.includes('--dry-run')
    const [email, fileArg = 'imports/worries.json'] = args
    if (!email) throw new Error('Usage: import:worries <email> [file] [--dry-run]')

    const file = path.resolve(process.cwd(), fileArg)
    const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as ImportRow[]
    if (!Array.isArray(rows)) throw new Error(`${fileArg} must be a JSON array`)

    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not set')
    await mongoose.connect(uri)

    const member = await Member.findOne({ email: norm(email) }).lean()
    if (!member) throw new Error(`No account for ${email}. Sign up or run create:admin first.`)
    const userId = String(member._id)

    await ensureDefaultCategories(userId)
    const categories = await Category.find({ userId }).lean()
    const findCategory = (key?: string) => {
        const k = norm(key || 'other')
        return categories.find((c) => c.slug === k || norm(c.name) === k)
    }
    const other = findCategory('other')!

    const existing: PreparedText[] = (await Worry.find({ userId }).select('description').lean()).map((d) =>
        prepareText(decryptField(d.description)),
    )

    let added = 0
    let skipped = 0
    for (const [i, row] of rows.entries()) {
        const text = String(row.description ?? '').trim()
        const label = `#${i + 1} "${text.slice(0, 60)}"`
        if (!text || text.length > WORRY_LIMITS.descriptionMaxLength) {
            console.log(`  skip ${label}: description is empty or too long`)
            skipped++
            continue
        }
        const prepared = prepareText(text)
        const best = existing.reduce((m, e) => Math.max(m, similarity(prepared, e)), 0)
        if (best >= SIMILARITY_THRESHOLD) {
            console.log(`  skip ${label}: looks like one you already have (${Math.round(best * 100)}% alike)`)
            skipped++
            continue
        }

        const category = findCategory(row.category)
        if (row.category && !category) console.log(`  note ${label}: no category "${row.category}", using Other`)
        const type = norm(row.type || 'anxiety')
        const status = (WORRY_STATUSES as readonly string[]).includes(norm(row.status || '')) ? norm(row.status!) : 'active'
        const control = (WORRY_CONTROLS as readonly string[]).includes(norm(row.control || '')) ? norm(row.control!) : 'partly'
        const intensity = Math.min(WORRY_LIMITS.intensityMax, Math.max(WORRY_LIMITS.intensityMin, Math.round(Number(row.intensity ?? 5)) || 5))

        if (!dryRun) {
            await Worry.create({
                userId,
                categoryId: (category ?? other)._id,
                description: encryptField(text),
                isAnxiety: type !== 'depression',
                isDepression: type === 'depression' || type === 'both',
                intensity,
                control,
                status,
                nextStep: encryptField(row.nextStep?.trim() ?? ''),
                reframe: encryptField(row.reframe?.trim() ?? ''),
                notes: encryptField(row.notes?.trim() ?? ''),
                tags: (row.tags ?? []).map(norm).filter(Boolean).slice(0, WORRY_LIMITS.tagsMax),
                resolvedAt: status === 'resolved' ? new Date() : null,
                seeded: false,
            })
        }
        existing.push(prepared)
        added++
        console.log(`  ${dryRun ? 'would add' : 'added'} ${label} → ${(category ?? other).name}, ${type}, ${intensity}`)
    }

    console.log(`\n${dryRun ? 'Dry run: would add' : 'Added'} ${added}, skipped ${skipped}, for ${member.email}`)
    await mongoose.disconnect()
}

run().catch((err) => {
    console.error('Import failed:', err.message ?? err)
    process.exit(1)
})
