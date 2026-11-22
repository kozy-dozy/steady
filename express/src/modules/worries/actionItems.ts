import { decryptField, encryptField } from '../../utils/fieldCrypto'
import { toIso } from '../../utils/serialize'

import { Worry } from './worries.model'

import type { ActionItemDto } from '@shared/dtos'

/** A new open action item, text encrypted, ready to push onto `actionItems`. */
export const newActionItem = (text: string) => ({ text: encryptField(text.trim()), done: false, doneAt: null })

/** Legacy seed/import rows still carry one `nextStep`; it becomes the first action item. */
export const actionItemsFrom = (nextStep?: string) => (nextStep?.trim() ? [newActionItem(nextStep)] : [])

export const openCount = (items: Array<{ done?: boolean }> = []) => items.filter((i) => !i.done).length

/** Open items oldest first (the first is "next"), then done items newest first. */
export function toActionItemDtos(items: any[] = []): ActionItemDto[] {
    const dtos = items.map((i) => ({
        id: String(i._id),
        text: decryptField(i.text),
        done: Boolean(i.done),
        createdAt: toIso(i.createdAt),
        doneAt: toIso(i.doneAt),
    }))
    const open = dtos.filter((i) => !i.done).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const done = dtos.filter((i) => i.done).sort((a, b) => b.doneAt.localeCompare(a.doneAt))
    return [...open, ...done]
}

/**
 * One-time move of the old single "next small step" into actionItems. Runs at boot and is
 * idempotent: rows are only touched while `nextStep` is still set, and it is cleared after.
 * The ciphertext moves as-is, so nothing is decrypted here.
 */
export async function migrateNextSteps() {
    const rows = await Worry.find({ nextStep: { $nin: ['', null] } }, { nextStep: 1, actionItems: 1 }).lean()
    for (const row of rows) {
        const update: Record<string, unknown> = { $set: { nextStep: '' } }
        if (!row.actionItems?.length) {
            update.$push = { actionItems: { text: row.nextStep, done: false, doneAt: null, createdAt: new Date() } }
        }
        await Worry.updateOne({ _id: row._id }, update, { timestamps: false })
    }
    if (rows.length) console.log(`action items: moved ${rows.length} next step(s)`)
}
