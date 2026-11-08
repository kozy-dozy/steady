import Button from '@kozy-dozy/ui/Button'
import Dialog from '@kozy-dozy/ui/Dialog'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuArrowLeft, LuTrash2 } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { apiListCategories } from '@/services/shared/CategoryService'
import { apiDeleteWorry, apiFindDuplicateWorries } from '@/services/shared/WorryService'
import { EmptyState, ErrorState, LoadingState } from '@/views/ecom/components/States'

import { Card, ErrorText, Muted, Page, PageHead, Row, SectionTitle, Title } from '../../components/ui'
import WorryCard from '../../components/WorryCard'
import { errorMessage } from '../../utils/worry'

import type { CategoryDto, WorryDto, WorryDuplicateGroupDto } from '@shared/dtos'

const Back = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
`

const Group = styled(Card)`
    gap: ${({ theme }) => theme.spacing.md};
`

const Item = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
`

const ItemActions = styled(Row)`
    justify-content: flex-end;
`

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
`

const groupKey = (g: WorryDuplicateGroupDto) => g.worries.map((w) => w.id).sort().join('-')

/**
 * Groups of worries that read alike. Open one to edit or merge by hand, delete the
 * extras, or "Keep both" to hide the group until the next visit.
 */
export default function Duplicates() {
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [groups, setGroups] = useState<WorryDuplicateGroupDto[] | null>(null)
    const [loadError, setLoadError] = useState(false)
    const [hidden, setHidden] = useState<Set<string>>(new Set())
    const [toDelete, setToDelete] = useState<WorryDto | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

    const load = useCallback(async () => {
        setLoadError(false)
        try {
            const res = await apiFindDuplicateWorries()
            setGroups(res.groups)
        } catch {
            setLoadError(true)
        }
    }, [])

    useEffect(() => {
        apiListCategories(true)
            .then((r) => setCategories(r.categories))
            .catch(() => setCategories([]))
        load()
    }, [load])

    const remove = async () => {
        if (!toDelete) return
        setDeleting(true)
        setDeleteError('')
        try {
            await apiDeleteWorry(toDelete.id)
            setToDelete(null)
            await load()
        } catch (err) {
            setDeleteError(errorMessage(err, 'Could not delete. Please try again.'))
        } finally {
            setDeleting(false)
        }
    }

    const visible = (groups ?? []).filter((g) => !hidden.has(groupKey(g)))

    return (
        <Page>
            <Back to="/">
                <LuArrowLeft aria-hidden="true" /> Back to my list
            </Back>
            <PageHead>
                <div>
                    <Title>Possible duplicates</Title>
                    <Muted>Worries that read alike. Open one to edit it, or delete the extra.</Muted>
                </div>
            </PageHead>

            {loadError && <ErrorState>Couldn&apos;t check for duplicates. Refresh to try again.</ErrorState>}
            {!loadError && !groups && <LoadingState />}
            {groups && visible.length === 0 && <EmptyState>No duplicates found. Every worry on your list is its own.</EmptyState>}

            <List>
                {visible.map((g) => (
                    <Group key={groupKey(g)}>
                        <Row style={{ justifyContent: 'space-between' }}>
                            <SectionTitle>{g.worries.length} similar entries</SectionTitle>
                            <Button size="sm" variant="plain" onClick={() => setHidden((h) => new Set(h).add(groupKey(g)))}>
                                Keep both
                            </Button>
                        </Row>
                        {g.worries.map((w) => (
                            <Item key={w.id}>
                                <WorryCard category={byId.get(w.categoryId)} worry={w} />
                                <ItemActions>
                                    <Button icon={<LuTrash2 aria-hidden="true" />} size="sm" variant="plain" onClick={() => setToDelete(w)}>
                                        Delete
                                    </Button>
                                </ItemActions>
                            </Item>
                        ))}
                    </Group>
                ))}
            </List>

            <Dialog isOpen={!!toDelete} width={420} onClose={() => setToDelete(null)} onRequestClose={() => setToDelete(null)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SectionTitle>Delete this entry?</SectionTitle>
                    <p>
                        &ldquo;{toDelete?.description}&rdquo; will be removed. This can&apos;t be undone.
                    </p>
                    {deleteError && <ErrorText role="alert">{deleteError}</ErrorText>}
                    <Row style={{ justifyContent: 'flex-end' }}>
                        <Button onClick={() => setToDelete(null)}>Keep it</Button>
                        <Button loading={deleting} variant="solid" onClick={remove}>
                            Delete
                        </Button>
                    </Row>
                </div>
            </Dialog>
        </Page>
    )
}
