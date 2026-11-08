import '../env'

import mongoose from 'mongoose'

import { Category } from '../modules/categories/categories.model'
import { ensureDefaultCategories } from '../modules/categories/defaultCategories'
import Member from '../modules/members/members.model'
import { Worry } from '../modules/worries/worries.model'
import { encryptField } from '../utils/fieldCrypto'

import { SEED_WORRIES } from './seed-data/worries'

/**
 * Seed placeholder worries for the owner account (the first admin).
 *
 *   yarn workspace steady-express seed           # insert when nothing is seeded yet
 *   yarn workspace steady-express seed --force   # replace the seeded rows
 *
 * Run `create:admin` first. The 12 starter categories are created for the account if missing.
 * Every worry carries `seeded: true`, so `--force` removes exactly what this script created and
 * never touches entries you added yourself. Text fields are encrypted like real entries.
 */

const DAY = 24 * 60 * 60 * 1000

async function run() {
    const force = process.argv.includes('--force')
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not set')

    await mongoose.connect(uri)
    console.log(`Seeding ${mongoose.connection.name}${force ? ' (--force)' : ''}`)

    const owner = await Member.findOne({ authority: 'admin' }).sort({ createdAt: 1 }).lean()
    if (!owner) throw new Error('No admin account yet. Run create:admin first.')
    const userId = String(owner._id)

    await ensureDefaultCategories(userId)
    const categories = await Category.find({ userId }).lean()
    const bySlug = new Map(categories.map((c) => [c.slug, c._id]))

    const already = await Worry.countDocuments({ userId, seeded: true })
    if (already > 0 && !force) {
        console.log(`  worries: ${already} seeded row(s) exist, skipping (use --force to replace)`)
        await mongoose.disconnect()
        return
    }
    if (force) {
        const removed = await Worry.deleteMany({ userId, seeded: true })
        if (removed.deletedCount) console.log(`  worries: removed ${removed.deletedCount} seeded row(s)`)
    }

    const now = Date.now()
    const rows = SEED_WORRIES.filter((w) => bySlug.has(w.category)).map((w) => {
        const createdAt = new Date(now - w.daysAgo * DAY)
        return {
            userId,
            categoryId: bySlug.get(w.category),
            description: encryptField(w.description),
            isAnxiety: w.isAnxiety,
            isDepression: w.isDepression,
            intensity: w.intensity,
            control: w.control,
            status: w.status,
            nextStep: encryptField(w.nextStep),
            reframe: encryptField(w.reframe),
            notes: encryptField(w.notes),
            tags: w.tags,
            resolvedAt: w.resolvedDaysAgo !== undefined ? new Date(now - w.resolvedDaysAgo * DAY) : null,
            createdAt,
            seeded: true,
        }
    })
    // Mongoose keeps a createdAt that is already set, so the dates stay spread out
    const inserted = await Worry.insertMany(rows)
    console.log(`  worries: inserted ${inserted.length} for ${owner.email}`)

    await mongoose.disconnect()
}

run().catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
})
