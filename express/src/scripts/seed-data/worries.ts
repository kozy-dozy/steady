import type { WorryControl, WorryStatus } from '@shared/dtos'

/** Placeholder worries (dummy data) for the owner account. `daysAgo` spreads them over ~6 weeks. */
export interface SeedWorry {
    category: string
    description: string
    isAnxiety: boolean
    isDepression: boolean
    intensity: number
    control: WorryControl
    status: WorryStatus
    nextStep: string
    reframe: string
    notes: string
    tags: string[]
    daysAgo: number
    resolvedDaysAgo?: number
}

export const SEED_WORRIES: SeedWorry[] = [
    {
        category: 'work-career',
        description: "Performance review is in two weeks and I don't know what my manager will say.",
        isAnxiety: true, isDepression: false, intensity: 7, control: 'partly', status: 'active',
        nextStep: 'Write down three wins from this quarter before Friday.',
        reframe: "One review doesn't define my career. The slip was a team issue and I flagged it early.",
        notes: 'Ask for specific examples if feedback is vague.', tags: ['review', 'manager'], daysAgo: 2,
    },
    {
        category: 'work-career',
        description: 'Tech is moving so fast I worry my skills are going stale.',
        isAnxiety: true, isDepression: false, intensity: 6, control: 'partly', status: 'improving',
        nextStep: 'Block one hour on Saturday morning for a small side project.',
        reframe: "I've learned new stacks before. Twenty years of picking things up is the skill.",
        notes: '', tags: ['learning'], daysAgo: 18,
    },
    {
        category: 'money-finances',
        description: 'Water heater is making noises. A big repair this month would hurt.',
        isAnxiety: true, isDepression: false, intensity: 5, control: 'partly', status: 'active',
        nextStep: 'Get one quote before deciding anything.',
        reframe: 'Noise is often sediment, not failure. A flush is cheap.',
        notes: '', tags: ['house', 'budget'], daysAgo: 6,
    },
    {
        category: 'money-finances',
        description: 'Not sure our 401(k) contributions are enough.',
        isAnxiety: true, isDepression: false, intensity: 4, control: 'yes', status: 'improving',
        nextStep: 'Run the numbers in the retirement calculator with real balances.',
        reframe: "We're contributing every month. Checking is how I stay in control of it.",
        notes: '', tags: ['retirement'], daysAgo: 25,
    },
    {
        category: 'kids-parenting',
        description: 'Highway driving at night for the first time.',
        isAnxiety: true, isDepression: false, intensity: 6, control: 'partly', status: 'improving',
        nextStep: 'Two practice drives on Saturday, one at dusk.',
        reframe: "They've been careful every time so far. Practice is what makes it safer.",
        notes: '', tags: ['driving'], daysAgo: 5,
    },
    {
        category: 'kids-parenting',
        description: 'College costs for two kids in a few years.',
        isAnxiety: true, isDepression: false, intensity: 7, control: 'partly', status: 'active',
        nextStep: 'Look up the net price calculator for two schools on their list.',
        reframe: "Sticker price isn't what most families pay. We have time to plan.",
        notes: '', tags: ['college', 'budget'], daysAgo: 12,
    },
    {
        category: 'kids-parenting',
        description: 'How much time they spend on social media.',
        isAnxiety: true, isDepression: false, intensity: 5, control: 'partly', status: 'active',
        nextStep: 'Ask them what they actually enjoy on it, without a lecture.',
        reframe: 'Staying curious keeps the door open, which matters more than the screen time number.',
        notes: '', tags: ['screens'], daysAgo: 9,
    },
    {
        category: 'health-body',
        description: 'Waking up at 4am most nights.',
        isAnxiety: true, isDepression: true, intensity: 6, control: 'partly', status: 'improving',
        nextStep: 'No screens after 10pm for one week, then compare.',
        reframe: 'Sleep has been better twice this week already.',
        notes: 'Worse after late coffee.', tags: ['sleep'], daysAgo: 8,
    },
    {
        category: 'self-identity',
        description: 'Feeling behind compared to friends my age.',
        isAnxiety: false, isDepression: true, intensity: 5, control: 'partly', status: 'active',
        nextStep: 'List three things I would not trade for anything.',
        reframe: "Everyone's timeline is different. Mine includes two great kids.",
        notes: '', tags: ['comparison'], daysAgo: 7,
    },
    {
        category: 'family',
        description: 'Parents are getting older and live far away.',
        isAnxiety: true, isDepression: true, intensity: 6, control: 'partly', status: 'active',
        nextStep: 'Set a standing Sunday call.',
        reframe: "Staying in touch is the part I can do, and it's enough for this week.",
        notes: '', tags: ['parents'], daysAgo: 15,
    },
    {
        category: 'world-news',
        description: 'AI changing what my job looks like.',
        isAnxiety: true, isDepression: true, intensity: 4, control: 'no', status: 'active',
        nextStep: 'Try one AI tool on a real task at work this week.',
        reframe: "Learning the tools is in my control even if the trend isn't.",
        notes: '', tags: ['ai', 'news'], daysAgo: 14,
    },
    {
        category: 'home',
        description: 'Roof might need replacing before winter.',
        isAnxiety: true, isDepression: false, intensity: 6, control: 'partly', status: 'resolved',
        nextStep: 'Book an inspection.',
        reframe: 'Find out first, then decide.',
        notes: 'Inspector said it has at least five more years. It never happened.', tags: ['house'], daysAgo: 40, resolvedDaysAgo: 30,
    },
]
