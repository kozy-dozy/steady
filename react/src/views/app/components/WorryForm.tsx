import Button from '@kozy-dozy/ui/Button'
import { WORRY_CONTROL_LABELS, WORRY_CONTROLS, WORRY_TYPE_LABELS, WORRY_TYPES } from '@shared/dtos'
import { Form, Formik, useFormikContext } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import { worrySchema, type WorryFormValues } from '../utils/worryForm'

import CategoryIcon from './CategoryIcon'
import {
    ErrorText,
    Field,
    FieldLabel,
    NativeSelect,
    PillButton,
    Range,
    Row,
    Segment,
    Segmented,
    TextArea,
    TextInput,
} from './ui'

import type { CategoryDto } from '@shared/dtos'
import type { ReactNode } from 'react'

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
`

const Details = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`

const Reframe = styled(Field)`
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.primaryLightAlt};
`

const ScaleEnds = styled.span`
    display: flex;
    justify-content: space-between;
    font-size: ${({ theme }) => theme.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.muted};
`

const Big = styled.strong`
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: ${({ theme }) => theme.fontSize['2xl']};
`

const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};

    @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }
`

function useField<K extends keyof WorryFormValues>(name: K) {
    const { values, setFieldValue, errors, touched } = useFormikContext<WorryFormValues>()
    return {
        value: values[name],
        set: (v: WorryFormValues[K]) => setFieldValue(name, v),
        error: touched[name] ? (errors[name] as string | undefined) : undefined,
    }
}

function CategoryPicker({ categories, asSelect }: { categories: CategoryDto[]; asSelect: boolean }) {
    const { value, set, error } = useField('categoryId')
    if (asSelect) {
        return (
            <Field>
                <FieldLabel>Category</FieldLabel>
                <NativeSelect value={value} onChange={(e) => set(e.target.value)}>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </NativeSelect>
                {error && <ErrorText>{error}</ErrorText>}
            </Field>
        )
    }
    return (
        <div role="group" aria-labelledby="cat-label" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <FieldLabel id="cat-label">Category</FieldLabel>
            <Row>
                {categories.map((c) => (
                    <PillButton key={c.id} type="button" $on={value === c.id} aria-pressed={value === c.id} onClick={() => set(c.id)}>
                        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <CategoryIcon name={c.icon} size={15} />
                            {c.name}
                        </span>
                    </PillButton>
                ))}
            </Row>
            {error && <ErrorText>{error}</ErrorText>}
        </div>
    )
}

function TypePicker() {
    const { value, set } = useField('type')
    return (
        <div role="group" aria-labelledby="type-label" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel id="type-label">Does it feel like…</FieldLabel>
            <Segmented>
                {WORRY_TYPES.map((t) => (
                    <Segment key={t} type="button" $on={value === t} aria-pressed={value === t} onClick={() => set(t)}>
                        {WORRY_TYPE_LABELS[t]}
                    </Segment>
                ))}
            </Segmented>
        </div>
    )
}

function IntensityPicker() {
    const { value, set } = useField('intensity')
    return (
        <Field>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <FieldLabel>How heavy is it?</FieldLabel>
                <Big>{value} / 10</Big>
            </span>
            <Range aria-valuetext={`${value} of 10`} max={10} min={1} step={1} value={value} onChange={(e) => set(Number(e.target.value))} />
            <ScaleEnds>
                <span>A little</span>
                <span>A lot</span>
            </ScaleEnds>
        </Field>
    )
}

function ControlPicker() {
    const { value, set } = useField('control')
    return (
        <div role="group" aria-labelledby="ctl-label" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel id="ctl-label">In my control?</FieldLabel>
            <Row>
                {WORRY_CONTROLS.map((c) => (
                    <PillButton key={c} type="button" $on={value === c} aria-pressed={value === c} onClick={() => set(c)}>
                        {WORRY_CONTROL_LABELS[c]}
                    </PillButton>
                ))}
            </Row>
        </div>
    )
}

function TextBox({ name, label, placeholder, multiline, as: Wrap = Field }: { name: 'description' | 'nextStep' | 'reframe' | 'notes' | 'tagsText'; label: string; placeholder?: string; multiline?: boolean; as?: typeof Field }) {
    const { values, handleChange, handleBlur, errors, touched } = useFormikContext<WorryFormValues>()
    const error = touched[name] ? errors[name] : undefined
    return (
        <Wrap>
            <FieldLabel>{label}</FieldLabel>
            {multiline ? (
                <TextArea name={name} placeholder={placeholder} rows={3} value={values[name]} onBlur={handleBlur} onChange={handleChange} />
            ) : (
                <TextInput name={name} placeholder={placeholder} value={values[name]} onBlur={handleBlur} onChange={handleChange} />
            )}
            {error && <ErrorText>{error}</ErrorText>}
        </Wrap>
    )
}

type Props = {
    initialValues: WorryFormValues
    categories: CategoryDto[]
    /** quick: phone-first add (details collapsed). full: edit page. */
    variant: 'quick' | 'full'
    submitLabel: string
    onSubmit: (values: WorryFormValues) => Promise<void>
    /** Extra buttons on the left of the action row (e.g. Delete). */
    leftActions?: ReactNode
    onCancel?: () => void
}

export default function WorryForm({ initialValues, categories, variant, submitLabel, onSubmit, leftActions, onCancel }: Props) {
    const [more, setMore] = useState(variant === 'full')
    const quick = variant === 'quick'

    return (
        <Formik<WorryFormValues> enableReinitialize initialValues={initialValues} validationSchema={worrySchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
                <Form noValidate>
                    <Stack>
                        {quick ? (
                            <>
                                <CategoryPicker categories={categories} asSelect={false} />
                                <TextBox name="description" label="Say it in a line" placeholder="e.g. Mortgage rate resets in March" />
                            </>
                        ) : (
                            <>
                                <TwoCol>
                                    <CategoryPicker asSelect categories={categories} />
                                    <TypePicker />
                                </TwoCol>
                                <TextBox multiline label="Description" name="description" />
                            </>
                        )}
                        {quick && <TypePicker />}
                        <IntensityPicker />

                        {quick && (
                            <div>
                                <PillButton type="button" aria-expanded={more} onClick={() => setMore((m) => !m)}>
                                    {more ? '− Fewer details' : '+ More details (optional)'}
                                </PillButton>
                            </div>
                        )}

                        {more && (
                            <Details>
                                <ControlPicker />
                                <TextBox name="nextStep" label="Next small step" placeholder="One concrete action" />
                                <TextBox multiline as={Reframe} label="A more balanced thought" name="reframe" placeholder="What would I tell a friend?" />
                                <TextBox multiline label="Notes" name="notes" />
                                <TextBox name="tagsText" label="Tags" placeholder="sleep, budget" />
                            </Details>
                        )}

                        {quick ? (
                            <Button block loading={isSubmitting} size="lg" type="submit" variant="solid">
                                {submitLabel}
                            </Button>
                        ) : (
                            <Row style={{ justifyContent: 'space-between' }}>
                                <div>{leftActions}</div>
                                <Row>
                                    {onCancel && (
                                        <Button type="button" onClick={onCancel}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" variant="solid" loading={isSubmitting}>
                                        {submitLabel}
                                    </Button>
                                </Row>
                            </Row>
                        )}
                    </Stack>
                </Form>
            )}
        </Formik>
    )
}
