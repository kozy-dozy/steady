import { BRIGHT_SPOT_LIMITS } from '@shared/dtos'
import { useEffect, useRef, useState } from 'react'
import { LuSun } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import { apiCreateBrightSpot, apiListBrightSpots } from '@/services/shared/BrightSpotService'

import { errorMessage } from '../../utils/worry'
import { ErrorText, PillButton, TextInput } from '../ui'

import BrightSpotPhoto from './BrightSpotPhoto'
import { SAND_LIGHT } from './sand'

import type { BrightSpotDto } from '@shared/dtos'
import type { FormEvent } from 'react'

const COPY = CONTENT_CONFIG.brightSpots

/** Width the app shell reserves on the right while the desktop panel is open. */
export const PANEL_WIDTH = 300
export const PANEL_GAP = 24

const Surface = styled.aside`
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.dropdown};
    display: flex;
    flex-direction: column;
    background: ${SAND_LIGHT};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.accentGold};
    box-shadow: ${({ theme }) => theme.shadow.md};

    /* Phone: a sheet above the bottom tabs */
    left: 0;
    right: 0;
    bottom: calc(70px + env(safe-area-inset-bottom));
    max-height: 55vh;
    border-radius: ${({ theme }) => `${theme.radius.xl} ${theme.radius.xl} 0 0`};

    @media (min-width: 1024px) {
        left: auto;
        right: ${PANEL_GAP}px;
        top: ${PANEL_GAP}px;
        bottom: auto;
        width: ${PANEL_WIDTH}px;
        max-height: calc(100vh - ${PANEL_GAP * 2}px);
        border-radius: ${({ theme }) => theme.radius.lg};
    }
`

const Head = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 8px 8px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.accentGold};

    h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: ${({ theme }) => theme.typography.fontPrimary};
        font-size: ${({ theme }) => theme.fontSize.lg};
        font-weight: 600;
    }
`

const HideButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 44px;
    padding: 0 12px;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.full};
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;
    font-size: ${({ theme }) => theme.fontSize.sm};
    cursor: pointer;

    &:hover {
        background: ${({ theme }) => theme.colors.accentGold};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
    }
`

/** Only the list scrolls; the header and add row stay put. */
const Scroll = styled.ul`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    list-style: none;
    margin: 0;
    padding: 4px 16px;

    li {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 0;
        border-bottom: 1px solid ${({ theme }) => theme.colors.accentGold};
        overflow-wrap: anywhere;
    }
    li:last-child {
        border-bottom: 0;
    }
`

const Foot = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.accentGold};
`

const AddRow = styled.form`
    display: flex;
    gap: 8px;
`

const LinkButton = styled.button`
    align-self: flex-start;
    min-height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
`

const Empty = styled.p`
    margin: 0;
    padding: 12px 16px;
    color: ${({ theme }) => theme.colors.text.secondary};
`

/** Closed state. Desktop: a tab at the top right. Phone: a pill bottom-left, across from the + button. */
const Opener = styled.button`
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.dropdown};
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 18px;
    border: 1px solid ${({ theme }) => theme.colors.accentGold};
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${SAND_LIGHT};
    color: ${({ theme }) => theme.colors.text.primary};
    box-shadow: ${({ theme }) => theme.shadow.md};
    font: inherit;
    font-weight: 700;
    cursor: pointer;

    left: ${({ theme }) => theme.spacing.md};
    bottom: calc(93px + env(safe-area-inset-bottom));

    @media (min-width: 1024px) {
        left: auto;
        bottom: auto;
        right: ${PANEL_GAP}px;
        top: ${PANEL_GAP}px;
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Photos show on desktop only; on a phone they aren't even loaded. */
    showPhotos: boolean
}

/** The always-there counterweight on the worry pages. All items, newest first; the list scrolls. */
export default function BrightSpotsPanel({ open, onOpenChange, showPhotos }: Props) {
    const [spots, setSpots] = useState<BrightSpotDto[] | null>(null)
    const [adding, setAdding] = useState(false)
    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const openerRef = useRef<HTMLButtonElement>(null)
    const hideRef = useRef<HTMLButtonElement>(null)
    const firstRender = useRef(true)

    useEffect(() => {
        apiListBrightSpots()
            .then((res) => setSpots(res.brightSpots))
            .catch(() => setSpots([]))
    }, [])

    // Keep keyboard focus on the control that replaced the one just pressed
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false
            return
        }
        ;(open ? hideRef : openerRef).current?.focus()
    }, [open])

    const add = async (e: FormEvent) => {
        e.preventDefault()
        const value = text.trim()
        if (!value) {
            setError('Type something first.')
            return
        }
        setBusy(true)
        setError('')
        try {
            const res = await apiCreateBrightSpot({ text: value })
            setSpots((s) => [res.brightSpot, ...(s ?? [])])
            setText('')
            setAdding(false)
        } catch (err) {
            setError(errorMessage(err, 'Could not save. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

    const count = spots?.length ?? 0

    if (!open) {
        return (
            <Opener ref={openerRef} type="button" aria-expanded={false} aria-controls="bright-spots-panel" onClick={() => onOpenChange(true)}>
                <LuSun aria-hidden="true" size={18} />
                {COPY.title}
                {count > 0 && <span aria-label={`${count} items`}>({count})</span>}
            </Opener>
        )
    }

    return (
        <Surface id="bright-spots-panel" aria-labelledby="bright-spots-title">
            <Head>
                <h2 id="bright-spots-title">
                    <LuSun aria-hidden="true" size={18} />
                    {COPY.title}
                </h2>
                <HideButton ref={hideRef} type="button" aria-expanded aria-controls="bright-spots-panel" onClick={() => onOpenChange(false)}>
                    Hide
                </HideButton>
            </Head>

            {spots && spots.length === 0 ? (
                <Empty>{COPY.empty}</Empty>
            ) : (
                <Scroll aria-label={COPY.title}>
                    {(spots ?? []).map((s) => (
                        <li key={s.id}>
                            {showPhotos && <BrightSpotPhoto spot={s} variant="panel" />}
                            <span>{s.text}</span>
                        </li>
                    ))}
                </Scroll>
            )}

            <Foot>
                {adding ? (
                    <AddRow noValidate onSubmit={add}>
                        <TextInput
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                            aria-label={`New ${COPY.title.toLowerCase()} item`}
                            maxLength={BRIGHT_SPOT_LIMITS.textMaxLength}
                            placeholder={COPY.placeholder}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value)
                                setError('')
                            }}
                            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
                        />
                        <PillButton $on type="submit" disabled={busy}>
                            Add
                        </PillButton>
                    </AddRow>
                ) : (
                    <LinkButton type="button" onClick={() => setAdding(true)}>
                        + Add one
                    </LinkButton>
                )}
                {error && <ErrorText role="alert">{error}</ErrorText>}
                <Link to="/bright-spots" style={{ fontSize: 14, color: 'inherit' }}>
                    Edit list
                </Link>
            </Foot>
        </Surface>
    )
}
