import express from 'express'

import asyncHandler from '../../../src/utils/asyncHandler'

import {
    confirmEmail,
    signIn,
    signUp,
    signOut,
    refreshTokenHandler,
    resendVerification,
    forgotPassword,
    resetPassword,
    me,
} from './auth.controller'

const router = express.Router()

router.post('/signup', asyncHandler(signUp))
router.post('/signin', asyncHandler(signIn))
router.post('/signout', asyncHandler(signOut))
router.get('/confirm-email', asyncHandler(confirmEmail))
router.post('/resend-verification', asyncHandler(resendVerification))
router.post('/refresh', refreshTokenHandler)
router.post('/forgot-password', asyncHandler(forgotPassword))
router.post('/reset-password', asyncHandler(resetPassword))
router.get('/me', asyncHandler(me))

export default router
