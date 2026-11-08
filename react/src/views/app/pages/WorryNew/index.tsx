import Button from '@kozy-dozy/ui/Button'
import { useEffect, useMemo, useState } from 'react'
import { LuCheck } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { CONTENT_CONFIG } from '@/config/content.config'
import { apiListCategories } from '@/services/shared/CategoryService'
import { apiCreateWorry } from '@/services/shared/WorryService'
import { ErrorState, LoadingState } from '@/views/ecom/components/States'

import { Card, ErrorText, PageHead, Title } from '../../components/ui'
import WorryForm from '../../components/WorryForm'
import { errorMessage, lastCategory, rememberCategory } from '../../utils/worry'
import { emptyWorry, toInput, type WorryFormValues } from '../../utils/worryForm'

import type { CategoryDto } from '@shared/dtos'

const Wrap = styled.div`
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md} 120px`};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};

    @media (min-width: 1024px) {
        padding-top: ${({ theme }) => theme.spacing['2xl']};
    }
`

const Done = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing.md}`};
`

const Badge = styled.div`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.accentGold};
    color: ${({ theme }) => theme.colors.text.primary};
`

export default function WorryNew() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<CategoryDto[] | null>(null)
    const [loadError, setLoadError] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [saved, setSaved] = useState(false)
    const [formKey, setFormKey] = useState(0)

    useEffect(() => {
        apiListCategories()
            .then((r) => setCategories(r.categories))
            .catch(() => setLoadError(true))
    }, [])

    // Memoised: Formik re-initialises whenever this object changes identity
    const initial = useMemo(() => {
        const list = categories ?? []
        const remembered = lastCategory()
        const pick = list.find((c) => c.id === remembered) ?? list[0]
        return emptyWorry(pick?.id ?? '')
        // formKey: "Add another" starts from the last-used category again
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories, formKey])

    const save = async (values: WorryFormValues) => {
        setSaveError('')
        try {
            await apiCreateWorry(toInput(values))
            rememberCategory(values.categoryId)
            setSaved(true)
        } catch (err) {
            setSaveError(errorMessage(err, 'Could not save. Please try again.'))
        }
    }

    if (saved) {
        return (
            <Wrap>
                <Card>
                    <Done role="status">
                        <Badge>
                            <LuCheck size={32} aria-hidden="true" />
                        </Badge>
                        <Title as="h2">{CONTENT_CONFIG.quickAdd.savedTitle}</Title>
                        <p>{CONTENT_CONFIG.quickAdd.savedBody}</p>
                        <Button block variant="solid" onClick={() => navigate('/')}>
                            Back to my list
                        </Button>
                        <Button
                            block
                            onClick={() => {
                                setSaved(false)
                                setFormKey((k) => k + 1)
                            }}
                        >
                            Add another
                        </Button>
                    </Done>
                </Card>
            </Wrap>
        )
    }

    return (
        <Wrap>
            <PageHead>
                <Title>{CONTENT_CONFIG.quickAdd.title}</Title>
                <Link to="/">Cancel</Link>
            </PageHead>
            {loadError && <ErrorState>Couldn&apos;t load your categories. Refresh to try again.</ErrorState>}
            {!loadError && !categories && <LoadingState />}
            {categories && (
                <Card>
                    {saveError && <ErrorText role="alert">{saveError}</ErrorText>}
                    <WorryForm key={formKey} variant="quick" categories={categories} initialValues={initial} submitLabel="Save" onSubmit={save} />
                </Card>
            )}
        </Wrap>
    )
}
