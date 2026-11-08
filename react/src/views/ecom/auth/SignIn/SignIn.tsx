import appConfig from '@kozy-dozy/foundation/config/app.config'
import styled from 'styled-components'

import SignInForm from '@/views/ecom/auth/SignIn/SignInForm'

const { forgotPasswordUrl } = appConfig

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

const SignIn = () => {
    return (
        <>
            <Header>
                <Title>Welcome back</Title>
                <Subtitle>
                    Sign in to your private worry list.
                </Subtitle>
            </Header>
            <SignInForm
                forgotPasswordUrl={`${forgotPasswordUrl}`}
            />
        </>
    )
}

export default SignIn
