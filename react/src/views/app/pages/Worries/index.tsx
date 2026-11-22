import Button from '@kozy-dozy/ui/Button'
import { WORRY_CONTROL_LABELS, WORRY_CONTROLS, WORRY_TYPE_LABELS, WORRY_TYPES } from '@shared/dtos'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuCopy, LuPlus } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import { apiListCategories } from '@/services/shared/CategoryService'
import { apiGetWorrySummary, apiListWorries } from '@/services/shared/WorryService'
import { EmptyState, ErrorState, LoadingState } from '@/views/ecom/components/States'

import { Card, Eyebrow, NativeSelect, PageHead, Page, Row, Segment, Segmented, Title } from '../../components/ui'
import WorryCard from '../../components/WorryCard'
import { todayLabel } from '../../utils/worry'

import type { CategoryDto, WorryControl, WorryDto, WorrySort, WorrySummaryDto, WorryType } from '@shared/dtos'

const STATUS_VIEWS = [
    { key: 'open', label: 'Active + Improving', value: 'active,improving' },
    { key: 'active', label: 'Active', value: 'active' },
    { key: 'improving', label: 'Improving', value: 'improving' },
    { key: 'resolved', label: 'Resolved', value: 'resolved' },
    { key: 'all', label: 'All statuses', value: '' },
] as const

const Stats = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.sm};

    @media (min-width: 768px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
`

const Stat = styled(Card)`
    gap: 2px;
    padding: ${({ theme }) => theme.spacing.md};

    strong {
        font-family: ${({ theme }) => theme.typography.fontPrimary};
        font-size: ${({ theme }) => theme.fontSize['2xl']};
        font-weight: 600;
    }
`

const HeadActions = styled(Row)`
    gap: ${({ theme }) => theme.spacing.sm};
`

const AddLink = styled(Link)`
    display: none;

    @media (min-width: 1024px) {
        display: inline-flex;
    }
`

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
`

const Filters = styled(Row)`
    gap: ${({ theme }) => theme.spacing.sm};

    ${Segmented} {
        flex: 1 1 100%;
    }

    @media (min-width: 768px) {
        ${Segmented} {
            flex: 0 0 auto;
        }
    }
`

export default function Worries() {
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [summary, setSummary] = useState<WorrySummaryDto | null>(null)
    const [worries, setWorries] = useState<WorryDto[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const [type, setType] = useState<WorryType | ''>('')
    const [categoryId, setCategoryId] = useState('')
    const [statusKey, setStatusKey] = useState<(typeof STATUS_VIEWS)[number]['key']>('open')
    const [control, setControl] = useState<WorryControl | ''>('')
    const [sort, setSort] = useState<WorrySort>('newest')

    const status = STATUS_VIEWS.find((s) => s.key === statusKey)?.value ?? ''
    const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
    const filtered = !!(type || categoryId || control || statusKey !== 'open')

    useEffect(() => {
        apiListCategories(true)
            .then((r) => setCategories(r.categories))
            .catch(() => setCategories([]))
        apiGetWorrySummary()
            .then((r) => setSummary(r.summary))
            .catch(() => setSummary(null))
    }, [])

    const load = useCallback(
        async (nextPage: number) => {
            setLoading(true)
            setError(false)
            try {
                const res = await apiListWorries({ type: type || undefined, categoryId, status, control: control || undefined, sort, page: nextPage })
                setWorries((prev) => (nextPage === 1 ? res.worries : [...prev, ...res.worries]))
                setTotal(res.total)
                setPage(nextPage)
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        },
        [type, categoryId, status, control, sort],
    )

    useEffect(() => {
        load(1)
    }, [load])

    const clear = () => {
        setType('')
        setCategoryId('')
        setStatusKey('open')
        setControl('')
    }

    return (
        <Page>
            <PageHead>
                <div>
                    <Eyebrow>{todayLabel()}</Eyebrow>
                    <Title>{CONTENT_CONFIG.list.title}</Title>
                </div>
                <HeadActions>
                    <Link to="/worries/duplicates">
                        <Button icon={<LuCopy aria-hidden="true" />}>Find duplicates</Button>
                    </Link>
                    <AddLink to="/worries/new">
                        <Button icon={<LuPlus aria-hidden="true" />} variant="solid">
                            Add a worry
                        </Button>
                    </AddLink>
                </HeadActions>
            </PageHead>

            {summary && (
                <Stats>
                    <Stat><span>Active</span><strong>{summary.active}</strong></Stat>
                    <Stat><span>Improving</span><strong>{summary.improving}</strong></Stat>
                    <Stat><span>Resolved</span><strong>{summary.resolved}</strong></Stat>
                    <Stat><span>Avg intensity (open)</span><strong>{summary.avgOpenIntensity || '–'}</strong></Stat>
                </Stats>
            )}

            <Filters>
                <Segmented role="group" aria-label="Type">
                    <Segment type="button" $on={type === ''} aria-pressed={type === ''} onClick={() => setType('')}>
                        All
                    </Segment>
                    {WORRY_TYPES.map((t) => (
                        <Segment key={t} type="button" $on={type === t} aria-pressed={type === t} onClick={() => setType(t)}>
                            {WORRY_TYPE_LABELS[t]}
                        </Segment>
                    ))}
                </Segmented>
                <NativeSelect aria-label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                            {c.isArchived ? ' (archived)' : ''}
                        </option>
                    ))}
                </NativeSelect>
                <NativeSelect aria-label="Status" value={statusKey} onChange={(e) => setStatusKey(e.target.value as typeof statusKey)}>
                    {STATUS_VIEWS.map((s) => (
                        <option key={s.key} value={s.key}>
                            {s.label}
                        </option>
                    ))}
                </NativeSelect>
                <NativeSelect aria-label="In my control" value={control} onChange={(e) => setControl(e.target.value as WorryControl | '')}>
                    <option value="">Any control</option>
                    {WORRY_CONTROLS.map((c) => (
                        <option key={c} value={c}>
                            In my control: {WORRY_CONTROL_LABELS[c]}
                        </option>
                    ))}
                </NativeSelect>
                <NativeSelect aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as WorrySort)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="intensity">Heaviest first</option>
                </NativeSelect>
                {filtered && (
                    <Button variant="plain" size="sm" onClick={clear}>
                        Clear filters
                    </Button>
                )}
            </Filters>

            {error && <ErrorState>Couldn&apos;t load your list. Check your connection and refresh.</ErrorState>}
            {!error && loading && worries.length === 0 && <LoadingState />}
            {!error && !loading && worries.length === 0 && (
                <EmptyState>{filtered ? CONTENT_CONFIG.list.emptyFiltered : CONTENT_CONFIG.list.empty}</EmptyState>
            )}

            <List>
                {worries.map((w) => (
                    <WorryCard key={w.id} worry={w} category={byId.get(w.categoryId)} />
                ))}
            </List>

            {worries.length < total && (
                <Button loading={loading} onClick={() => load(page + 1)}>
                    Show more
                </Button>
            )}
        </Page>
    )
}
