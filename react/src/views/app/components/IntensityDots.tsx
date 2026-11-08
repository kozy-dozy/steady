import styled from 'styled-components'

const Dots = styled.span`
    display: inline-flex;
    gap: 3px;
`

const Dot = styled.i<{ $on: boolean }>`
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme, $on }) => ($on ? theme.colors.primary : theme.colors.border.default)};
`

export default function IntensityDots({ value }: { value: number }) {
    return (
        <Dots role="img" aria-label={`Intensity ${value} of 10`}>
            {Array.from({ length: 10 }, (_, i) => (
                <Dot key={i} $on={i < value} />
            ))}
        </Dots>
    )
}
