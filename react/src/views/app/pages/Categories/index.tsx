import Button from '@kozy-dozy/ui/Button'
import Dialog from '@kozy-dozy/ui/Dialog'
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LIMITS } from '@shared/dtos'
import { useEffect, useState } from 'react'
import { LuArchive, LuArchiveRestore, LuChevronDown, LuChevronUp, LuPencil } from 'react-icons/lu'
import styled from 'styled-components'

import {
    apiCreateCategory,
    apiListCategories,
    apiReorderCategories,
    apiUpdateCategory,
} from '@/services/shared/CategoryService'
import { ErrorState, LoadingState } from '@/views/ecom/components/States'

import CategoryIcon from '../../components/CategoryIcon'
import { Card, ErrorText, Field, FieldLabel, Muted, Page, PageHead, Row, SectionTitle, TextInput, Title } from '../../components/ui'
import { errorMessage } from '../../utils/worry'

import type { CategoryDto, CategoryIcon as IconName } from '@shared/dtos'

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: ${({ theme }) => theme.colors.bg.card};
    overflow: hidden;
`

const Item = styled.li<{ $archived: boolean }>`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    opacity: ${({ $archived }) => ($archived ? 0.6 : 1)};

    &:last-child {
        border-bottom: 0;
    }
`

const Swatch = styled.span<{ $color: string }>`
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.bg.muted};
    color: ${({ $color }) => $color};
`

const Name = styled.div`
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;

    small {
        color: ${({ theme }) => theme.colors.text.muted};
        font-size: ${({ theme }) => theme.fontSize.sm};
    }
`

const IconBtn = styled.button`
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.bg.card};
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;

    &:disabled {
        opacity: 0.35;
        cursor: default;
    }
`

const Count = styled.span`
    flex: 0 0 auto;
    min-width: 72px;
    text-align: right;
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.fontSize.sm};
`

const Choices = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

const Choice = styled.button<{ $on: boolean; $color?: string }>`
    width: 44px;
    height: 44px;
    border-radius: ${({ theme }) => theme.radius.md};
    border: 2px solid ${({ theme, $on }) => ($on ? theme.colors.text.primary : theme.colors.border.default)};
    background: ${({ theme, $color }) => $color ?? theme.colors.bg.card};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`

type Draft = { id?: string; name: string; hint: string; icon: IconName; color: string }

export default function Categories() {
    const [categories, setCategories] = useState<CategoryDto[] | null>(null)
    const [loadError, setLoadError] = useState(false)
    const [error, setError] = useState('')
    const [newName, setNewName] = useState('')
    const [draft, setDraft] = useState<Draft | null>(null)
    const [busy, setBusy] = useState(false)

    const load = () =>
        apiListCategories(true)
            .then((r) => setCategories(r.categories))
            .catch(() => setLoadError(true))

    useEffect(() => {
        load()
    }, [])

    const add = async () => {
        if (!newName.trim()) return
        setError('')
        setBusy(true)
        try {
            await apiCreateCategory({ name: newName.trim() })
            setNewName('')
            await load()
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    const saveDraft = async () => {
        if (!draft?.id) return
        setError('')
        try {
            await apiUpdateCategory(draft.id, { name: draft.name.trim(), hint: draft.hint.trim(), icon: draft.icon, color: draft.color })
            setDraft(null)
            await load()
        } catch (err) {
            setError(errorMessage(err))
        }
    }

    const toggleArchive = async (c: CategoryDto) => {
        setError('')
        try {
            await apiUpdateCategory(c.id, { isArchived: !c.isArchived })
            await load()
        } catch (err) {
            setError(errorMessage(err))
        }
    }

    const move = async (index: number, dir: -1 | 1) => {
        if (!categories) return
        const next = [...categories]
        const [moved] = next.splice(index, 1)
        next.splice(index + dir, 0, moved)
        setCategories(next)
        try {
            await apiReorderCategories(next.map((c) => c.id))
        } catch (err) {
            setError(errorMessage(err))
            load()
        }
    }

    return (
        <Page>
            <PageHead>
                <div>
                    <Title>Categories</Title>
                    <Muted>Rename, recolor, reorder or add your own. Archiving hides one from the list but keeps its entries.</Muted>
                </div>
            </PageHead>

            <Card>
                <Field>
                    <FieldLabel>New category</FieldLabel>
                    <Row>
                        <TextInput
                            style={{ flex: '1 1 240px', width: 'auto' }}
                            value={newName}
                            maxLength={CATEGORY_LIMITS.nameMaxLength}
                            placeholder="e.g. Sports / Hobbies"
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
                        />
                        <Button variant="solid" onClick={add} loading={busy} disabled={!newName.trim()}>
                            Add
                        </Button>
                    </Row>
                </Field>
            </Card>

            {error && <ErrorText role="alert">{error}</ErrorText>}
            {loadError && <ErrorState>Couldn't load categories. Refresh to try again.</ErrorState>}
            {!loadError && !categories && <LoadingState />}

            {categories && (
                <List>
                    {categories.map((c, i) => (
                        <Item key={c.id} $archived={c.isArchived}>
                            <Swatch $color={c.color}>
                                <CategoryIcon name={c.icon} size={20} />
                            </Swatch>
                            <Name>
                                <strong>
                                    {c.name}
                                    {c.isArchived ? ' (archived)' : ''}
                                </strong>
                                {c.hint && <small>{c.hint}</small>}
                            </Name>
                            <Count>
                                {c.worryCount} {c.worryCount === 1 ? 'entry' : 'entries'}
                            </Count>
                            <IconBtn type="button" aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                                <LuChevronUp aria-hidden="true" />
                            </IconBtn>
                            <IconBtn type="button" aria-label={`Move ${c.name} down`} disabled={i === categories.length - 1} onClick={() => move(i, 1)}>
                                <LuChevronDown aria-hidden="true" />
                            </IconBtn>
                            <IconBtn type="button" aria-label={`Edit ${c.name}`} onClick={() => setDraft({ id: c.id, name: c.name, hint: c.hint, icon: c.icon, color: c.color })}>
                                <LuPencil aria-hidden="true" />
                            </IconBtn>
                            {!c.isDefault && (
                                <IconBtn type="button" aria-label={c.isArchived ? `Restore ${c.name}` : `Archive ${c.name}`} onClick={() => toggleArchive(c)}>
                                    {c.isArchived ? <LuArchiveRestore aria-hidden="true" /> : <LuArchive aria-hidden="true" />}
                                </IconBtn>
                            )}
                        </Item>
                    ))}
                </List>
            )}

            <Dialog isOpen={!!draft} width={520} onClose={() => setDraft(null)} onRequestClose={() => setDraft(null)}>
                {draft && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SectionTitle>Edit category</SectionTitle>
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <TextInput value={draft.name} maxLength={CATEGORY_LIMITS.nameMaxLength} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                        </Field>
                        <Field>
                            <FieldLabel>Examples (optional)</FieldLabel>
                            <TextInput value={draft.hint} maxLength={CATEGORY_LIMITS.hintMaxLength} onChange={(e) => setDraft({ ...draft, hint: e.target.value })} />
                        </Field>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <FieldLabel>Icon</FieldLabel>
                            <Choices role="group" aria-label="Icon">
                                {CATEGORY_ICONS.map((icon) => (
                                    <Choice key={icon} type="button" $on={draft.icon === icon} aria-pressed={draft.icon === icon} aria-label={icon.replace(/^Lu/, '')} onClick={() => setDraft({ ...draft, icon })}>
                                        <CategoryIcon name={icon} size={20} />
                                    </Choice>
                                ))}
                            </Choices>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <FieldLabel>Color</FieldLabel>
                            <Choices role="group" aria-label="Color">
                                {CATEGORY_COLORS.map((color) => (
                                    <Choice key={color} type="button" $on={draft.color === color} $color={color} aria-pressed={draft.color === color} aria-label={color} onClick={() => setDraft({ ...draft, color })} />
                                ))}
                            </Choices>
                        </div>
                        <Row style={{ justifyContent: 'flex-end' }}>
                            <Button onClick={() => setDraft(null)}>Cancel</Button>
                            <Button variant="solid" onClick={saveDraft} disabled={!draft.name.trim()}>
                                Save
                            </Button>
                        </Row>
                    </div>
                )}
            </Dialog>
        </Page>
    )
}
