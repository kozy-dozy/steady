/**
 * Plain-text similarity for spotting duplicate worries.
 *
 * Worry text is encrypted at rest, so Mongo can't compare it. Callers decrypt one
 * user's own worries in memory and score them here. Nothing is logged or stored.
 *
 * Score (0..1) is the best of:
 * - word overlap (Dice) on meaningful words, after light stemming
 * - "short one fits inside the long one" (containment), when the short one has 2+ words
 * - letter-trigram overlap, which catches typos and word-form changes
 */

const STOP_WORDS = new Set(
    (
        'a an and are as at be been but by can could did do does dont don for from get got had has have ' +
        'he her his how i im ive id if in into is it its just like me my myself no not of on or our out ' +
        'so some still that the their them then there they this to too up us very was we were what when ' +
        'where which who will with would you your about again all am any because being going gonna really ' +
        'thing things know think feel feeling worried worry worrying anxious'
    ).split(' '),
)

/**
 * Match threshold. Tuned on sample entries: rewordings of the same worry score 0.6 to 0.9,
 * unrelated seed entries stay under 0.3. Leans toward asking: a false match only costs
 * a "Save anyway" tap.
 */
export const SIMILARITY_THRESHOLD = 0.6

const stem = (w: string) => {
    if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3)
    if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2)
    if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
    return w
}

export interface PreparedText {
    words: Set<string>
    trigrams: Set<string>
}

export function prepareText(text: string): PreparedText {
    const cleaned = text
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
    const words = new Set(
        cleaned
            .split(' ')
            .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
            .map(stem),
    )
    const joined = ` ${[...words].sort().join(' ')} `
    const trigrams = new Set<string>()
    for (let i = 0; i + 3 <= joined.length; i++) trigrams.add(joined.slice(i, i + 3))
    return { words, trigrams }
}

const overlap = (a: Set<string>, b: Set<string>) => {
    let n = 0
    const [small, big] = a.size <= b.size ? [a, b] : [b, a]
    for (const x of small) if (big.has(x)) n++
    return n
}

export function similarity(a: PreparedText, b: PreparedText): number {
    if (!a.words.size || !b.words.size) return 0
    const shared = overlap(a.words, b.words)
    const dice = (2 * shared) / (a.words.size + b.words.size)
    const minWords = Math.min(a.words.size, b.words.size)
    // A short entry that fits inside a longer one ("Roof needs replacing" vs a longer
    // roof worry). Two-word entries count for less, since two words match by chance more.
    const containment = minWords >= 3 ? (shared / minWords) * 0.9 : minWords === 2 ? (shared / 2) * 0.8 : 0
    const tri = (2 * overlap(a.trigrams, b.trigrams)) / (a.trigrams.size + b.trigrams.size || 1)
    return Math.max(dice, containment, tri * 0.95)
}
