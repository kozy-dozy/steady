import { BRIGHT_SPOT_LIMITS } from '@shared/dtos'
import { useEffect, useState } from 'react'
import { LuPencil, LuSun, LuTrash2 } from 'react-icons/lu'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import {
    apiCreateBrightSpot,
    apiDeleteBrightSpot,
    apiListBrightSpots,
    apiUpdateBrightSpot,
} from '@/services/shared/BrightSpotService'
import { ErrorState, LoadingState } from '@/views/ecom/components/States'

import { SAND_LIGHT } from '../../components/brightSpots/sand'
import { Card, ErrorText, Muted, Page, PillButton, Row, TextInput, Title } from '../../components/ui'
import { errorMessage, longDate } from '../../utils/worry'

import type { BrightSpotDto } from '@shared/dtos'
import type { FormEvent } from 'react'

const COPY = CONTENT_CONFIG.brightSpots

const Wrap = styled(Page)`
    max-width: 720px;
`

const AddCard = styled(Card)`
    background: ${SAND_LIGHT};
    border-color: ${({ theme }) => theme.colors.accentGold};
`

const AddRow = styled.form`
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
`

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`

const Item = styled.li`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: 8px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

    &:last-child {
        border-bottom: 0;
    }
`

const Text = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-wrap: anywhere;

    small {
        color: ${({ theme }) => theme.colors.text.muted};
    }
`

const IconButton = styled.button`
    flex: none;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: ${({ theme }) => theme.colors.text.muted};
    cursor: pointer;

    &:hover {
        background: ${({ theme }) => theme.colors.bg.hover};
        color: ${({ theme }) => theme.colors.text.primary};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
    }
`

function SpotRow({ spot, onSaved, onDeleted }: { spot: BrightSpotDto; onSaved: (s: BrightSpotDto) => void; onDeleted: (id: string) => void }) {
    const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view')
    const [text, setText] = useState(spot.text)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const save = async (e: FormEvent) => {
        e.preventDefault()
        const value = text.trim()
        if (!value) {
            setError('Type something first.')
            return
        }
        setBusy(true)
        try {
            const res = await apiUpdateBrightSpot(spot.id, { text: value })
            onSaved(res.brightSpot)
            setMode('view')
            setError('')
        } catch (err) {
            setError(errorMessage(err, 'Could not save. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

    const remove = async () => {
        setBusy(true)
        try {
            await apiDeleteBrightSpot(spot.id)
            onDeleted(spot.id)
        } catch (err) {
            setError(errorMessage(err, 'Could not delete. Please try again.'))
            setBusy(false)
        }
    }

    if (mode === 'edit') {
        return (
            <Item style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <AddRow noValidate onSubmit={save}>
                    <TextInput
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        aria-label="Edit bright spot"
                        maxLength={BRIGHT_SPOT_LIMITS.textMaxLength}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setMode('view')}
                    />
                    <PillButton $on type="submit" disabled={busy}>
                        Save
                    </PillButton>
                    <PillButton
                        type="button"
                        onClick={() => {
                            setText(spot.text)
                            setMode('view')
                            setError('')
                        }}
                    >
                        Cancel
                    </PillButton>
                </AddRow>
                {error && <ErrorText role="alert">{error}</ErrorText>}
            </Item>
        )
    }

    return (
        <Item>
            <Text>
                <span>{spot.text}</span>
                <small>{longDate(spot.createdAt)}</small>
                {error && <ErrorText role="alert">{error}</ErrorText>}
            </Text>
            {mode === 'confirm' ? (
                <Row>
                    <PillButton type="button" onClick={() => setMode('view')}>
                        Keep it
                    </PillButton>
                    <PillButton $on type="button" disabled={busy} onClick={remove}>
                        Delete
                    </PillButton>
                </Row>
            ) : (
                <>
                    <IconButton type="button" aria-label={`Edit: ${spot.text}`} onClick={() => setMode('edit')}>
                        <LuPencil aria-hidden="true" size={18} />
                    </IconButton>
                    <IconButton type="button" aria-label={`Delete: ${spot.text}`} onClick={() => setMode('confirm')}>
                        <LuTrash2 aria-hidden="true" size={18} />
                    </IconButton>
                </>
            )}
        </Item>
    )
}

export default function BrightSpots() {
    const [spots, setSpots] = useState<BrightSpotDto[] | null>(null)
    const [loadError, setLoadError] = useState(false)
    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        apiListBrightSpots()
            .then((res) => setSpots(res.brightSpots))
            .catch(() => setLoadError(true))
    }, [])

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
        } catch (err) {
            setError(errorMessage(err, 'Could not save. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <Wrap>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Title style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <LuSun aria-hidden="true" size={30} />
                    {COPY.title}
                </Title>
                <Muted>{COPY.intro}</Muted>
            </div>

            <AddCard>
                <AddRow noValidate onSubmit={add}>
                    <TextInput
                        aria-label={`New ${COPY.title.toLowerCase()} item`}
                        maxLength={BRIGHT_SPOT_LIMITS.textMaxLength}
                        placeholder={COPY.placeholder}
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value)
                            setError('')
                        }}
                    />
                    <PillButton $on type="submit" disabled={busy}>
                        Add
                    </PillButton>
                </AddRow>
                {error && <ErrorText role="alert">{error}</ErrorText>}
            </AddCard>

            {loadError ? (
                <ErrorState>Could not load your bright spots. Please refresh.</ErrorState>
            ) : !spots ? (
                <LoadingState />
            ) : spots.length === 0 ? (
                <Muted>{COPY.empty}</Muted>
            ) : (
                <Card>
                    <List aria-label={COPY.title}>
                        {spots.map((s) => (
                            <SpotRow
                                key={s.id}
                                spot={s}
                                onSaved={(u) => setSpots((all) => (all ?? []).map((x) => (x.id === u.id ? u : x)))}
                                onDeleted={(id) => setSpots((all) => (all ?? []).filter((x) => x.id !== id))}
                            />
                        ))}
                    </List>
                </Card>
            )}
        </Wrap>
    )
}
