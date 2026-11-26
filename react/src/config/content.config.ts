/** Copy that more than one component reads. Page-specific copy lives in the page itself. */
export const CONTENT_CONFIG = {
    /** 988 Suicide & Crisis Lifeline (US). Shown on sign-in and in the app shell everywhere. */
    help: {
        title: 'Need help now?',
        body: 'Free, confidential, 24/7. Call or text 988 to reach the Suicide & Crisis Lifeline.',
        short: 'Help · 988',
        callLabel: 'Call 988',
        textLabel: 'Text 988',
        callHref: 'tel:988',
        textHref: 'sms:988',
        moreHref: 'https://988lifeline.org',
        emergency: 'If you are in immediate danger, call 911.',
    },

    list: {
        title: "What's on your mind",
        empty: 'Nothing on the list. When something starts to weigh on you, add it here.',
        emptyFiltered: 'No entries match these filters.',
    },

    /** Focus + Parked: only a few worries in front of you at once. */
    focus: {
        title: 'Focus',
        intro: 'Up to 3 at a time. Everything else waits in Parked.',
        emptySlot: 'Pick a worry to focus on',
        firstTime: 'Pick up to 3 to focus on. The rest can wait.',
        parkedTitle: 'Parked for later',
        parkedNote: "Parked doesn't mean forgotten. It's written down, so you don't have to hold it right now.",
        full: 'Focus is full. Finish or park one first.',
        slotOpened: 'Its focus spot is open. Pick your next one from Parked, or leave it open.',
    },

    quickAdd: {
        title: "What's on your mind?",
        savedTitle: 'Written down.',
        savedBody: "It's on your list now. You don't have to carry it in your head.",
    },

    /** The counterweight list. Name lives here only, so it is easy to rename. */
    brightSpots: {
        title: 'Bright Spots',
        intro: 'The people, comforts, and good moments in your life, big or small. They sit beside your worries, so the worry list never tells the whole story.',
        empty: 'Start with one: a person you love, a small comfort like your morning coffee, or a good moment.',
        placeholder: 'Something that went okay',
    },

    resolved: {
        title: 'Nice work letting this one go.',
        body: 'Add a line to the notes about how it turned out.',
    },
} as const
