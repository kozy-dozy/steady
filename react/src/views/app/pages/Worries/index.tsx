import Button from '@kozy-dozy/ui/Button'
import { WORRY_CONTROL_LABELS, WORRY_CONTROLS, WORRY_TYPE_LABELS, WORRY_TYPES } from '@shared/dtos'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuChevronDown, LuChevronRight, LuCopy, LuPlus, LuTarget } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import { apiListCategories } from '@/services/shared/CategoryService'
import { apiGetWorrySummary, apiListFocusWorries, apiListWorries, apiSetWorryFocus } from '@/services/shared/WorryService'
import { EmptyState, ErrorState, LoadingState } from '@/views/ecom/components/States'

import { Card, ErrorText, Eyebrow, Muted, NativeSelect, PageHead, Page, PillButton, Row, SectionTitle, Segment, Segmented, Title } from '../../components/ui'
import WorryCard from '../../components/WorryCard'
import { errorMessage, todayLabel } from '../../utils/worry'

import type { CategoryDto, WorryControl, WorryDto, WorrySort, WorrySummaryDto, WorryType } from '@shared/dtos'

const FOCUS = CONTENT_CONFIG.focus

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

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`

const SectionHead = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`

/** An open Focus spot: a calm invitation, not a gap to fill. */
const EmptySlot = styled.button`
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed ${({ theme }) => theme.colors.border.strong};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: transparent;
    color: ${({ theme }) => theme.colors.text.muted};
    font: inherit;
    cursor: pointer;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.primary};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`

/** Collapsed by default every visit, so the page opens calm. */
const ParkedToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 56px;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: ${({ theme }) => theme.colors.bg.muted};
    color: ${({ theme }) => theme.colors.text.primary};
    font: inherit;
    text-align: left;
    cursor: pointer;

    strong {
        font-family: ${({ theme }) => theme.typography.fontPrimary};
        font-size: ${({ theme }) => theme.fontSize.lg};
    }
    span:last-child {
        margin-left: auto;
        color: ${({ theme }) => theme.colors.text.muted};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
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

    const [focus, setFocus] = useState<WorryDto[] | null>(null)
    const [focusMax, setFocusMax] = useState(3)
    const [focusError, setFocusError] = useState('')
    const [parkedOpen, setParkedOpen] = useState(false)
    const parkedRef = useRef<HTMLElement>(null)

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
        apiListFocusWorries()
            .then((r) => {
                setFocus(r.worries)
                setFocusMax(r.max)
            })
            .catch(() => setFocus([]))
    }, [])

    const load = useCallback(
        async (nextPage: number) => {
            setLoading(true)
            setError(false)
            try {
                const res = await apiListWorries({ type: type || undefined, categoryId, status, control: control || undefined, focus: 'no', sort, page: nextPage })
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

    const focusOn = async (w: WorryDto) => {
        setFocusError('')
        try {
            const res = await apiSetWorryFocus(w.id, true)
            setFocus((f) => [...(f ?? []), res.worry])
            setWorries((all) => all.filter((x) => x.id !== w.id))
            setTotal((t) => Math.max(0, t - 1))
        } catch (err) {
            setFocusError(errorMessage(err, 'Could not move it to Focus. Please try again.'))
        }
    }

    const openParked = () => {
        setParkedOpen(true)
        requestAnimationFrame(() => parkedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }

    // Filters only apply to the lower list; using one opens it so you can see the results
    const showParked = parkedOpen || filtered
    const focusFull = (focus?.length ?? 0) >= focusMax
    const openSlots = Math.max(0, focusMax - (focus?.length ?? 0))
    const nothingYet = focus !== null && focus.length === 0 && !loading && !error && total === 0 && !filtered
    const lowerTitle = statusKey === 'open' ? FOCUS.parkedTitle : `${STATUS_VIEWS.find((v) => v.key === statusKey)?.label ?? 'Other'} (not in Focus)`

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

            {nothingYet ? (
                <EmptyState>{CONTENT_CONFIG.list.empty}</EmptyState>
            ) : (
                <>
                    <Section aria-labelledby="focus-title">
                        <SectionHead>
                            <SectionTitle id="focus-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <LuTarget aria-hidden="true" size={20} />
                                {FOCUS.title}
                            </SectionTitle>
                            <Muted>{focus && focus.length === 0 && total > 0 ? FOCUS.firstTime : FOCUS.intro}</Muted>
                        </SectionHead>
                        {focusError && <ErrorText role="alert">{focusError}</ErrorText>}
                        {!focus ? (
                            <LoadingState />
                        ) : (
                            <List>
                                {focus.map((w) => (
                                    <WorryCard key={w.id} worry={w} category={byId.get(w.categoryId)} />
                                ))}
                                {Array.from({ length: openSlots }, (_, i) => (
                                    <EmptySlot key={`slot-${i}`} type="button" onClick={openParked}>
                                        <LuPlus aria-hidden="true" size={18} />
                                        {FOCUS.emptySlot}
                                    </EmptySlot>
                                ))}
                            </List>
                        )}
                    </Section>

                    <Section ref={parkedRef} aria-labelledby="parked-title">
                        <ParkedToggle type="button" aria-expanded={showParked} aria-controls="parked-list" onClick={() => setParkedOpen((o) => !o)}>
                            {showParked ? <LuChevronDown aria-hidden="true" size={20} /> : <LuChevronRight aria-hidden="true" size={20} />}
                            <strong id="parked-title">{lowerTitle}</strong>
                            <span>{loading && worries.length === 0 ? '' : `${total} ${showParked ? 'shown' : total === 1 ? 'worry' : 'worries'}`}</span>
                        </ParkedToggle>

                        {showParked && (
                            <div id="parked-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {statusKey === 'open' && <Muted>{FOCUS.parkedNote}</Muted>}
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
                                    <EmptyState>{filtered ? CONTENT_CONFIG.list.emptyFiltered : 'Nothing parked right now.'}</EmptyState>
                                )}

                                <List>
                                    {worries.map((w) => (
                                        <WorryCard
                                            key={w.id}
                                            worry={w}
                                            category={byId.get(w.categoryId)}
                                            footer={
                                                w.status === 'resolved' ? undefined : focusFull ? (
                                                    <span>{FOCUS.full}</span>
                                                ) : (
                                                    <PillButton type="button" onClick={() => focusOn(w)}>
                                                        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                                            <LuTarget aria-hidden="true" size={16} /> Focus on this
                                                        </span>
                                                    </PillButton>
                                                )
                                            }
                                        />
                                    ))}
                                </List>

                                {worries.length < total && (
                                    <Button loading={loading} onClick={() => load(page + 1)}>
                                        Show more
                                    </Button>
                                )}
                            </div>
                        )}
                    </Section>
                </>
            )}
        </Page>
    )
}
