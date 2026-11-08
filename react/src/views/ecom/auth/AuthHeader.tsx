import styled from 'styled-components'

const Header = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    font-family: ${({ theme }) => theme.typography.fontPrimary};
    font-size: ${({ theme }) => theme.fontSize['3xl']};
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.colors.text.dark};
`

const Subtitle = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.md};
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.text.secondary};
`

type AuthHeaderProps = {
    title: string
    subtitle: string
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => (
    <Header>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
    </Header>
)

export default AuthHeader
