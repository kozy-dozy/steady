import Theme from '@kozy-dozy/layout/Theme'
import ProtectedRoute from '@kozy-dozy/routing/ProtectedRoute'
import PublicRoute from '@kozy-dozy/routing/PublicRoute'
import PageTransition from '@kozy-dozy/shared/PageTransition'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { useInitializeReduxState } from '@/store/domainHooks'
import AppShell from '@/views/app/components/AppShell'
import OwnerGuard from '@/views/app/components/OwnerGuard'
import AuthLayout from '@/views/ecom/components/AuthLayout'

import GoogleAnalytics from './views/ecom/components/GoogleAnalytics'

import type { ReactNode } from 'react'

// App pages (owner-only: everything sits behind sign-in)
const Worries = lazy(() => import('@/views/app/pages/Worries'))
const WorryNew = lazy(() => import('@/views/app/pages/WorryNew'))
const WorryEdit = lazy(() => import('@/views/app/pages/WorryEdit'))
const Categories = lazy(() => import('@/views/app/pages/Categories'))
const Account = lazy(() => import('@/views/app/pages/Account'))

// Auth pages (no public sign-up: the account comes from `create:admin`)
const SignIn = lazy(() => import('@/views/ecom/auth/SignIn'))
const ForgotPassword = lazy(() => import('@/views/ecom/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/views/ecom/auth/ResetPassword'))

const publicOnly = (page: ReactNode) => <PublicRoute>{page}</PublicRoute>

function AppRoutes() {
    return (
        <Suspense fallback={<PageTransition />}>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route path="/sign-in" element={publicOnly(<SignIn />)} />
                    <Route path="/forgot-password" element={publicOnly(<ForgotPassword />)} />
                    <Route path="/reset-password" element={publicOnly(<ResetPassword />)} />
                </Route>

                <Route
                    element={
                        <ProtectedRoute>
                            <OwnerGuard />
                        </ProtectedRoute>
                    }
                >
                    <Route element={<AppShell />}>
                        <Route path="/" element={<Worries />} />
                        <Route path="/worries/new" element={<WorryNew />} />
                        <Route path="/worries/:id" element={<WorryEdit />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/account" element={<Account />} />
                    </Route>
                </Route>

                {/* The shared auth packages send signed-in users to /admin/dashboard */}
                <Route path="/admin/*" element={<Navigate replace to="/" />} />
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
        </Suspense>
    )
}

function App() {
    useInitializeReduxState()

    return (
        <BrowserRouter>
            <GoogleAnalytics />
            <Theme>
                <AppRoutes />
            </Theme>
        </BrowserRouter>
    )
}

export default App
