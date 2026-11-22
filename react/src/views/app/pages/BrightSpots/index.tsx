import { BRIGHT_SPOT_LIMITS } from '@shared/dtos'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LuCamera, LuImagePlus, LuPencil, LuSun, LuTrash2, LuX } from 'react-icons/lu'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import {
    apiCreateBrightSpot,
    apiDeleteBrightSpot,
    apiDeleteBrightSpotImage,
    apiListBrightSpots,
    apiPutBrightSpotImage,
    apiUpdateBrightSpot,
} from '@/services/shared/BrightSpotService'
import { ErrorState, LoadingState } from '@/views/ecom/components/States'

import BrightSpotPhoto from '../../components/brightSpots/BrightSpotPhoto'
import { ImageError, prepareImage } from '../../components/brightSpots/prepareImage'
import { SAND_LIGHT } from '../../components/brightSpots/sand'
import { forgetBrightSpotImage, rememberBrightSpotImage } from '../../components/brightSpots/useBrightSpotImage'
import { Card, ErrorText, Muted, Page, PillButton, Row, TextInput, Title } from '../../components/ui'
import { errorMessage, longDate } from '../../utils/worry'

import type { BrightSpotDto } from '@shared/dtos'
import type { BrightSpotImageInput } from '@shared/dtos'
import type { ChangeEvent, FormEvent } from 'react'

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

const HiddenFile = styled.input.attrs({ type: 'file', accept: 'image/*' })`
    display: none;
`

const Preview = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    img {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: ${({ theme }) => theme.radius.md};
    }
`

const photoError = (err: unknown) => (err instanceof ImageError ? err.message : errorMessage(err, 'The photo could not be saved. Please try again.'))

/** Upload a prepared photo and prime the cache so it shows right away. */
async function uploadPhoto(spotId: string, photo: BrightSpotImageInput) {
    const res = await apiPutBrightSpotImage(spotId, photo)
    rememberBrightSpotImage(res.brightSpot, `data:${photo.mime};base64,${photo.data}`)
    return res.brightSpot
}

function SpotRow({ spot, onSaved, onDeleted }: { spot: BrightSpotDto; onSaved: (s: BrightSpotDto) => void; onDeleted: (id: string) => void }) {
    const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view')
    const [text, setText] = useState(spot.text)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        setBusy(true)
        setError('')
        try {
            onSaved(await uploadPhoto(spot.id, await prepareImage(file)))
        } catch (err) {
            setError(photoError(err))
        } finally {
            setBusy(false)
        }
    }

    const removePhoto = async () => {
        setBusy(true)
        try {
            const res = await apiDeleteBrightSpotImage(spot.id)
            forgetBrightSpotImage(spot.id)
            onSaved(res.brightSpot)
        } catch (err) {
            setError(errorMessage(err, 'Could not remove the photo. Please try again.'))
        } finally {
            setBusy(false)
        }
    }

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
            forgetBrightSpotImage(spot.id)
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
                {spot.image && (
                    <div>
                        <PillButton type="button" disabled={busy} onClick={removePhoto}>
                            Remove photo
                        </PillButton>
                    </div>
                )}
                {error && <ErrorText role="alert">{error}</ErrorText>}
            </Item>
        )
    }

    return (
        <Item>
            <BrightSpotPhoto spot={spot} variant="thumb" />
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
                    <HiddenFile ref={fileRef} tabIndex={-1} aria-hidden="true" onChange={pickPhoto} />
                    <IconButton
                        type="button"
                        aria-label={`${spot.image ? 'Change' : 'Add'} photo: ${spot.text}`}
                        disabled={busy}
                        onClick={() => fileRef.current?.click()}
                    >
                        <LuCamera aria-hidden="true" size={18} />
                    </IconButton>
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
    const [photo, setPhoto] = useState<File | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo])
    useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview])

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
        // Prepare the photo first, so a bad file stops here before anything is saved
        let prepared: BrightSpotImageInput | null = null
        try {
            prepared = photo ? await prepareImage(photo) : null
        } catch (err) {
            setError(photoError(err))
            setBusy(false)
            return
        }
        try {
            let spot = (await apiCreateBrightSpot({ text: value })).brightSpot
            setText('')
            setPhoto(null)
            if (prepared) {
                try {
                    spot = await uploadPhoto(spot.id, prepared)
                } catch (err) {
                    setError(`Saved, but the photo didn't upload: ${photoError(err)} Use the camera button to try again.`)
                }
            }
            setSpots((s) => [spot, ...(s ?? [])])
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
                        {busy ? 'Saving…' : 'Add'}
                    </PillButton>
                </AddRow>
                <HiddenFile
                    ref={fileRef}
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(e) => {
                        setPhoto(e.target.files?.[0] ?? null)
                        e.target.value = ''
                        setError('')
                    }}
                />
                {photo ? (
                    <Preview>
                        <img alt="Selected photo" src={preview} />
                        <PillButton type="button" onClick={() => setPhoto(null)}>
                            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                <LuX aria-hidden="true" size={16} /> Remove photo
                            </span>
                        </PillButton>
                    </Preview>
                ) : (
                    <div>
                        <PillButton type="button" onClick={() => fileRef.current?.click()}>
                            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                <LuImagePlus aria-hidden="true" size={16} /> Add a photo (optional)
                            </span>
                        </PillButton>
                    </div>
                )}
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
