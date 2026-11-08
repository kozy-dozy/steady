/**
 * Create (or promote) an admin account.
 *
 *   yarn workspace steady-express create:admin <email> <password> [firstName] [lastName]
 *
 * Steady is owner-only (no public sign-up), so this is how your account is made.
 * It also creates the 12 starter categories for the account.
 */
import '../env'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import { ensureDefaultCategories } from '../modules/categories/defaultCategories'
import Member from '../modules/members/members.model'

async function main() {
    const [email, password, firstName = 'Admin', lastName = 'User'] = process.argv.slice(2)
    if (!email || !password) {
        console.error('Usage: create:admin <email> <password> [firstName] [lastName]')
        process.exit(1)
    }
    if (password.length < 10) {
        console.error('Use a password of at least 10 characters.')
        process.exit(1)
    }

    await mongoose.connect(process.env.MONGODB_URI!)
    const normalized = email.trim().toLowerCase()
    const hash = await bcrypt.hash(password, 10)
    const existing = await Member.findOne({ email: normalized })

    if (existing) {
        existing.authority = ['user', 'admin'] as any
        existing.role = 'admin'
        existing.password = hash
        existing.emailVerified = true
        await existing.save()
        await ensureDefaultCategories(String(existing._id))
        console.log(`Promoted existing member to admin: ${normalized}`)
    } else {
        const created = await Member.create({
            firstName,
            lastName,
            email: normalized,
            password: hash,
            role: 'admin',
            authority: ['user', 'admin'],
            emailVerified: true,
        })
        await ensureDefaultCategories(String(created._id))
        console.log(`Created admin: ${normalized}`)
    }
    await mongoose.disconnect()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
