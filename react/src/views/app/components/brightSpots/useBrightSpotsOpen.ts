import { useEffect, useState } from 'react'

/** Same breakpoint as the app shell's sidebar. */
const DESKTOP = '(min-width: 1024px)'
const KEY = { desktop: 'steady.brightSpots.open.desktop', mobile: 'steady.brightSpots.open.mobile' }
/** Open by default on desktop (there's room); closed on phone. */
const DEFAULT = { desktop: true, mobile: false }

type Mode = keyof typeof KEY

function read(mode: Mode) {
    try {
        const v = localStorage.getItem(KEY[mode])
        return v === null ? DEFAULT[mode] : v === '1'
    } catch {
        return DEFAULT[mode]
    }
}

/** Show/hide for the Bright Spots panel, remembered separately for desktop and phone. */
export default function useBrightSpotsOpen() {
    const [mode, setMode] = useState<Mode>(() => (window.matchMedia(DESKTOP).matches ? 'desktop' : 'mobile'))
    const [open, setOpenState] = useState(() => read(mode))

    useEffect(() => {
        const mq = window.matchMedia(DESKTOP)
        const onChange = () => {
            const next: Mode = mq.matches ? 'desktop' : 'mobile'
            setMode(next)
            setOpenState(read(next))
        }
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])

    const setOpen = (value: boolean) => {
        setOpenState(value)
        try {
            localStorage.setItem(KEY[mode], value ? '1' : '0')
        } catch {
            // Private mode etc.: still works for this visit
        }
    }

    return { open, setOpen, isDesktop: mode === 'desktop' }
}
