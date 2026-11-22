import { WORRY_LIMITS } from '@shared/dtos'
import { useEffect, useRef, useState } from 'react'
import { LuCheck, LuX } from 'react-icons/lu'
import styled from 'styled-components'

import { apiAddActionItem, apiDeleteActionItem, apiUpdateActionItem } from '@/services/shared/WorryService'

import { errorMessage } from '../utils/worry'

import { Card, ErrorText, Muted, PillButton, SectionTitle, TextInput } from './ui'

import type { ActionItemDto, WorryDto } from '@shared/dtos'
import type { FormEvent } from 'react'

const UNDO_MS = 6000
const MAX_OPEN = WORRY_LIMITS.actionItemsOpenMax

const Head = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
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
    padding: 6px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`

const ItemText = styled.span<{ $done?: boolean }>`
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    color: ${({ theme, $done }) => ($done ? theme.colors.text.muted : theme.colors.text.primary)};
    text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
`

/** 44px tap target around a 26px circle. */
const Check = styled.button<{ $done?: boolean }>`
    flex: none;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;

    span {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${({ theme, $done }) => ($done ? theme.colors.primary : theme.colors.border.default)};
        background: ${({ theme, $done }) => ($done ? theme.colors.primary : theme.colors.bg.card)};
        color: ${({ theme }) => theme.colors.text.inverse};
    }
    &:hover span {
        border-color: ${({ theme }) => theme.colors.primary};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: -2px;
        border-radius: 50%;
    }
    &:disabled {
        cursor: default;
    }
`

const Remove = styled(Check)`
    color: ${({ theme }) => theme.colors.text.muted};
    &:hover {
        color: ${({ theme }) => theme.colors.text.primary};
    }
`

const NextTag = styled.span`
    flex: none;
    padding: 2px 10px;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSize.xs};
    font-weight: 700;
`

const AddRow = styled.form`
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
`

/** Sand moment for a finished item (dark text only on accentGold). */
const UndoBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: 4px 4px 4px 14px;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.accentGold};
    color: ${({ theme }) => theme.colors.text.primary};
`

const UndoButton = styled.button`
    min-height: 44px;
    padding: 0 14px;
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
`

const DoneLabel = styled.span`
    font-size: ${({ theme }) => theme.fontSize.sm};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-top: ${({ theme }) => theme.spacing.sm};
`

type Props = {
    worry: WorryDto
    onChange: (worry: WorryDto) => void
}

/** Up to 3 open action items. Every change saves right away; finishing one offers Undo. */
export default function ActionItems({ worry, onChange }: Props) {
    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [undo, setUndo] = useState<ActionItemDto | null>(null)
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const open = worry.actionItems.filter((i) => !i.done)
    const done = worry.actionItems.filter((i) => i.done)
    const full = open.length >= MAX_OPEN

    useEffect(() => () => clearTimeout(timer.current), [])

    const run = async (call: () => Promise<{ worry: WorryDto }>) => {
        setBusy(true)
        setError('')
        try {
            const res = await call()
            onChange(res.worry)
            return true
        } catch (err) {
            setError(errorMessage(err, 'Could not save. Please try again.'))
            return false
        } finally {
            setBusy(false)
        }
    }

    const showUndo = (item: ActionItemDto | null) => {
        clearTimeout(timer.current)
        setUndo(item)
        if (item) timer.current = setTimeout(() => setUndo(null), UNDO_MS)
    }

    const add = async (e: FormEvent) => {
        e.preventDefault()
        const value = text.trim()
        if (!value) {
            setError('Type an action item first.')
            return
        }
        if (await run(() => apiAddActionItem(worry.id, { text: value }))) {
            setText('')
            showUndo(null)
        }
    }

    const setDone = async (item: ActionItemDto, value: boolean) => {
        if (await run(() => apiUpdateActionItem(worry.id, item.id, { done: value }))) {
            showUndo(value ? item : null)
        }
    }

    const remove = (item: ActionItemDto) => {
        if (undo?.id === item.id) showUndo(null)
        return run(() => apiDeleteActionItem(worry.id, item.id))
    }

    return (
        <Card>
            <Head>
                <SectionTitle>Action Items</SectionTitle>
                <Muted>
                    {open.length} of {MAX_OPEN}
                </Muted>
            </Head>

            {open.length > 0 ? (
                <List aria-label="Open action items">
                    {open.map((item, i) => (
                        <Item key={item.id}>
                            <Check type="button" aria-label={`Mark done: ${item.text}`} disabled={busy} onClick={() => setDone(item, true)}>
                                <span />
                            </Check>
                            <ItemText>{item.text}</ItemText>
                            {i === 0 && <NextTag>Next</NextTag>}
                            <Remove type="button" aria-label={`Remove: ${item.text}`} disabled={busy} onClick={() => remove(item)}>
                                <LuX aria-hidden="true" size={18} />
                            </Remove>
                        </Item>
                    ))}
                </List>
            ) : (
                <Muted>What&apos;s one small thing you could do about this?</Muted>
            )}

            <div aria-live="polite">
                {undo && (
                    <UndoBar>
                        <span>Nice work. That one&apos;s done.</span>
                        <UndoButton type="button" disabled={busy} onClick={() => setDone(undo, false)}>
                            Undo
                        </UndoButton>
                    </UndoBar>
                )}
            </div>

            {full ? (
                <Muted>You have {MAX_OPEN} action items. Finish one to add another.</Muted>
            ) : (
                <AddRow noValidate onSubmit={add}>
                    <TextInput
                        aria-label="New action item"
                        maxLength={WORRY_LIMITS.actionItemMaxLength}
                        placeholder="One small, concrete step"
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
            )}
            {error && <ErrorText role="alert">{error}</ErrorText>}

            {done.length > 0 && (
                <>
                    <DoneLabel>Done ({done.length})</DoneLabel>
                    <List aria-label="Done action items">
                        {done.map((item) => (
                            <Item key={item.id}>
                                <Check
                                    $done
                                    type="button"
                                    aria-label={full ? `Done: ${item.text}` : `Reopen: ${item.text}`}
                                    disabled={busy || full}
                                    onClick={() => setDone(item, false)}
                                >
                                    <span>
                                        <LuCheck aria-hidden="true" size={16} strokeWidth={3} />
                                    </span>
                                </Check>
                                <ItemText $done>{item.text}</ItemText>
                                <Remove type="button" aria-label={`Remove: ${item.text}`} disabled={busy} onClick={() => remove(item)}>
                                    <LuX aria-hidden="true" size={18} />
                                </Remove>
                            </Item>
                        ))}
                    </List>
                </>
            )}
        </Card>
    )
}
