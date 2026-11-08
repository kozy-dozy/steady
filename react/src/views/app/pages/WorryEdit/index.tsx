import Button from '@kozy-dozy/ui/Button'
import Dialog from '@kozy-dozy/ui/Dialog'
import { WORRY_STATUS_LABELS, WORRY_STATUSES } from '@shared/dtos'
import { useEffect, useMemo, useState } from 'react'
import { LuArrowLeft } from 'react-icons/lu'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import { apiListCategories } from '@/services/shared/CategoryService'
import { apiDeleteWorry, apiGetWorry, apiUpdateWorry } from '@/services/shared/WorryService'
import { ErrorState, LoadingState } from '@/views/ecom/components/States'

import CategoryIcon from '../../components/CategoryIcon'
import WorryForm from '../../components/WorryForm'
import { Card, Chip, ErrorText, Page, Row, SectionTitle, Title } from '../../components/ui'
import { errorMessage, longDate } from '../../utils/worry'
import { toFormValues, toInput, type WorryFormValues } from '../../utils/worryForm'

import type { CategoryDto, WorryDto, WorryStatus } from '@shared/dtos'

const Layout = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.lg};
    align-items: flex-start;
`

const Main = styled(Card)`
    flex: 999 1 520px;
`

const Side = styled.div`
    flex: 1 1 280px;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`

const StatusButton = styled.button<{ $tone: WorryStatus; $on: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    padding: 0 16px;
    border-radius: ${({ theme }) => theme.radius.md};
    font: inherit;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    background: ${({ theme }) => theme.colors.bg.card};
    color: ${({ theme }) => theme.colors.text.primary};

    ${({ $on, $tone, theme }) =>
        $on &&
        ($tone === 'active'
            ? `background:${theme.colors.status.errorBg};color:${theme.colors.brandRed};font-weight:700;border-color:${theme.colors.status.errorBg};`
            : $tone === 'improving'
              ? `background:#F6EBD5;color:${theme.colors.status.warning};font-weight:700;border-color:#F6EBD5;`
              : `background:${theme.colors.status.successBg};color:${theme.colors.status.success};font-weight:700;border-color:${theme.colors.status.successBg};`)}

    &::before {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: currentColor;
    }
`

const Kudos = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.accentGold};
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const Meta = styled.div`
    display: flex;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fontSize.sm};

    span:first-child {
        color: ${({ theme }) => theme.colors.text.muted};
    }
`

export default function WorryEdit() {
    const { id = '' } = useParams()
    const navigate = useNavigate()
    const [worry, setWorry] = useState<WorryDto | null>(null)
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [notFound, setNotFound] = useState(false)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    useEffect(() => {
        Promise.all([apiGetWorry(id), apiListCategories(true)])
            .then(([w, c]) => {
                setWorry(w.worry)
                setCategories(c.categories)
            })
            .catch(() => setNotFound(true))
    }, [id])

    const initialValues = useMemo(() => (worry ? toFormValues(worry) : null), [worry])
    const category = categories.find((c) => c.id === worry?.categoryId)
    // Archived categories stay selectable only for the entry that already uses them
    const pickable = categories.filter((c) => !c.isArchived || c.id === worry?.categoryId)

    const save = async (values: WorryFormValues) => {
        setError('')
        try {
            const res = await apiUpdateWorry(id, { ...toInput(values), status: worry?.status })
            setWorry(res.worry)
            navigate('/')
        } catch (err) {
            setError(errorMessage(err, 'Could not save. Please try again.'))
        }
    }

    const setStatus = async (status: WorryStatus) => {
        if (!worry || status === worry.status) return
        setSaving(true)
        setError('')
        try {
            const res = await apiUpdateWorry(id, { status })
            setWorry(res.worry)
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    const remove = async () => {
        try {
            await apiDeleteWorry(id)
            navigate('/')
        } catch (err) {
            setConfirmDelete(false)
            setError(errorMessage(err, 'Could not delete. Please try again.'))
        }
    }

    if (notFound) {
        return (
            <Page>
                <ErrorState>That entry doesn't exist any more.</ErrorState>
                <Link to="/">Back to worries</Link>
            </Page>
        )
    }
    if (!worry || !initialValues) {
        return (
            <Page>
                <LoadingState />
            </Page>
        )
    }

    return (
        <Page>
            <Link to="/" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <LuArrowLeft aria-hidden="true" /> Back to worries
            </Link>
            <Row>
                {category && (
                    <Chip>
                        <CategoryIcon name={category.icon} size={14} color={category.color} />
                        {category.name}
                    </Chip>
                )}
                {worry.isAnxiety && <Chip $tone="anxiety">Anxiety</Chip>}
                {worry.isDepression && <Chip $tone="depression">Depression</Chip>}
            </Row>
            <Title>{worry.description}</Title>
            {error && <ErrorText role="alert">{error}</ErrorText>}

            <Layout>
                <Main>
                    <WorryForm
                        variant="full"
                        categories={pickable}
                        initialValues={initialValues}
                        submitLabel="Save changes"
                        onSubmit={save}
                        onCancel={() => navigate('/')}
                        leftActions={
                            <Button type="button" variant="plain" onClick={() => setConfirmDelete(true)}>
                                Delete
                            </Button>
                        }
                    />
                </Main>

                <Side>
                    <Card>
                        <SectionTitle>Where is it now?</SectionTitle>
                        <div role="group" aria-label="Status" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {WORRY_STATUSES.map((s) => (
                                <StatusButton
                                    key={s}
                                    type="button"
                                    $tone={s}
                                    $on={worry.status === s}
                                    aria-pressed={worry.status === s}
                                    disabled={saving}
                                    onClick={() => setStatus(s)}
                                >
                                    {WORRY_STATUS_LABELS[s]}
                                </StatusButton>
                            ))}
                        </div>
                        {worry.status === 'resolved' && (
                            <Kudos>
                                <strong>{CONTENT_CONFIG.resolved.title}</strong>
                                <span>{CONTENT_CONFIG.resolved.body}</span>
                            </Kudos>
                        )}
                    </Card>
                    <Card>
                        <Meta><span>Created</span><span>{longDate(worry.createdAt)}</span></Meta>
                        <Meta><span>Updated</span><span>{longDate(worry.updatedAt)}</span></Meta>
                        <Meta><span>Resolved</span><span>{longDate(worry.resolvedAt)}</span></Meta>
                    </Card>
                </Side>
            </Layout>

            <Dialog isOpen={confirmDelete} width={420} onClose={() => setConfirmDelete(false)} onRequestClose={() => setConfirmDelete(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SectionTitle>Delete this entry?</SectionTitle>
                    <p>This can't be undone. If it just isn't a worry any more, you can mark it Resolved instead.</p>
                    <Row style={{ justifyContent: 'flex-end' }}>
                        <Button onClick={() => setConfirmDelete(false)}>Keep it</Button>
                        <Button variant="solid" onClick={remove}>
                            Delete
                        </Button>
                    </Row>
                </div>
            </Dialog>
        </Page>
    )
}
