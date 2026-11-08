import { WORRY_CONTROL_LABELS, WORRY_STATUS_LABELS } from '@shared/dtos'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ago } from '../utils/worry'

import CategoryIcon from './CategoryIcon'
import IntensityDots from './IntensityDots'
import { Chip } from './ui'

import type { CategoryDto, WorryDto } from '@shared/dtos'

const CardLink = styled(Link)`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    background: ${({ theme }) => theme.colors.bg.card};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radius.lg};
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;

    &:hover {
        border-color: ${({ theme }) => theme.colors.border.strong};
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
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

export default function WorryCard({ worry, category }: { worry: WorryDto; category?: CategoryDto }) {
    const step = worry.nextStep ? `Next step: ${worry.nextStep}` : worry.reframe ? `Reframe: ${worry.reframe}` : ''
    return (
        <CardLink to={`/worries/${worry.id}`}>
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
        </CardLink>
    )
}
