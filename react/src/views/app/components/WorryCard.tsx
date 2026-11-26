import { WORRY_CONTROL_LABELS, WORRY_STATUS_LABELS } from '@shared/dtos'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { ago } from '../utils/worry'

import CategoryIcon from './CategoryIcon'
import IntensityDots from './IntensityDots'
import { Chip } from './ui'

import type { CategoryDto, WorryDto } from '@shared/dtos'
import type { ReactNode } from 'react'

const box = css`
    background: ${({ theme }) => theme.colors.bg.card};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radius.lg};
`

const linkBody = css`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;

    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`

const CardLink = styled(Link)`
    ${box}
    ${linkBody}

    &:hover {
        border-color: ${({ theme }) => theme.colors.border.strong};
    }
`

/** Card with a footer row (e.g. "Focus on this"): the button sits outside the link. */
const Shell = styled.div`
    ${box}
    display: flex;
    flex-direction: column;

    &:hover {
        border-color: ${({ theme }) => theme.colors.border.strong};
    }
`

const PlainLink = styled(Link)`
    ${linkBody}
    border-radius: ${({ theme }) => theme.radius.lg};
`

const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => `0 ${theme.spacing.lg} ${theme.spacing.md}`};
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.fontSize.sm};
`

const Top = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
`

const When = styled.span`
    margin-left: auto;
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.fontSize.sm};
`

const Text = styled.strong`
    font-size: ${({ theme }) => theme.fontSize.lg};
    line-height: 1.4;
`

const Meta = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    flex-wrap: wrap;
    align-items: center;
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.muted};
`

const Step = styled.span`
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
`

export default function WorryCard({ worry, category, footer }: { worry: WorryDto; category?: CategoryDto; footer?: ReactNode }) {
    const next = worry.actionItems.find((i) => !i.done)
    const step = next ? `Next: ${next.text}` : worry.reframe ? `Reframe: ${worry.reframe}` : ''
    const body = (
        <>
            <Top>
                {category && (
                    <Chip>
                        <CategoryIcon name={category.icon} size={14} color={category.color} />
                        {category.name}
                    </Chip>
                )}
                {worry.isAnxiety && <Chip $tone="anxiety">Anxiety</Chip>}
                {worry.isDepression && <Chip $tone="depression">Depression</Chip>}
                <When>{ago(worry.createdAt)}</When>
            </Top>
            <Text>{worry.description}</Text>
            <Meta>
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                    Intensity {worry.intensity}
                    <IntensityDots value={worry.intensity} />
                </span>
                <span>{WORRY_CONTROL_LABELS[worry.control]} in my control</span>
                <Chip $tone={worry.status}>{WORRY_STATUS_LABELS[worry.status]}</Chip>
            </Meta>
            {step && <Step>{step}</Step>}
        </>
    )
    if (!footer) return <CardLink to={`/worries/${worry.id}`}>{body}</CardLink>
    return (
        <Shell>
            <PlainLink to={`/worries/${worry.id}`}>{body}</PlainLink>
            <Footer>{footer}</Footer>
        </Shell>
    )
}
