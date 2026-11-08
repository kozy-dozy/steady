import crypto from 'crypto'

import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { ONE_HOUR_MS, TWO_DAYS_MS, ONE_DAY_MS } from '../../constants/time'
import { sendEmailTemplate } from '../../services/mailer'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import {
    validate,
    signUpSchema,
    signInSchema,
    type SignUpData,
    type SignInData,
} from '../../utils/validators'
import { verifyRecaptchaToken } from '../../utils/verifyRecaptchaToken'
import Member from '../members/members.model'

import type { MemberDto } from '@shared/dtos'

function getCookieBaseOptions() {
    const isProd = process.env.NODE_ENV === 'production'
    const sameSite = isProd ? ('none' as const) : ('lax' as const)
    const secure = isProd
    return { sameSite, secure, path: '/' as const }
}

// POST /auth/signup
export async function signUp(req: Request, res: Response) {
    // 🔹 VALIDATE INPUT
    const { value: validatedData, error: validationError } =
        validate<SignUpData>(req.body, signUpSchema)

    if (validationError) {
        res.status(400).json({
            error:
                validationError.details[0]?.message ||
                'Please check your input and try again.',
        })
        return
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpires = new Date(Date.now() + ONE_DAY_MS)

    const { recaptchaToken, email, password, firstName, lastName, role } =
        validatedData

    const isHuman = await verifyRecaptchaToken(recaptchaToken)
    if (!isHuman) {
        res.status(400).json({
            error: 'reCAPTCHA validation failed. Please try again.',
        })
        return
    }

    try {
        const existingUser = await Member.findOne({ email })
            .select('_id')
            .lean()
        if (existingUser) {
            res.status(409).json({
                error: 'An account with that email already exists. Please sign in or use a different email.',
            })
            return
        }

        const member = await Member.create({
            email,
            password: await bcrypt.hash(password, 12),
            firstName,
            lastName,
            role,
            emailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: tokenExpires,
            authority: ['user'],
        })

        const memberDto: MemberDto = {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            emailVerified: member.emailVerified,
            authority: member.authority,
            role: member.role as MemberDto['role'],
        }

        const verificationUrl = `${
            process.env.API_BASE_URL
        }/auth/confirm-email?token=${encodeURIComponent(verificationToken)}`

        try {
            await sendEmailTemplate({
                to: member.email,
                subject: `Welcome, ${member.firstName}!`, // optional
                templateId: process.env.MAILERSEND_TEMPLATE_SIGN_UP!, // put your template id here or env
                data: {
                    name: member.firstName,
                    action_url: verificationUrl,
                    support_url: `${process.env.FRONTEND_BASE_URL}/support`,
                    login_url: `${process.env.FRONTEND_BASE_URL}/login`,
                    account_name: process.env.APP_NAME || 'Steady',
                    from_name: process.env.MAILERSEND_FROM_NAME || 'Steady',
                },
            })
        } catch (error) {
            console.error('Email send error (MailerSend):', error)
        }

        res.status(201).json({
            member: memberDto,
            message:
                'Signup successful! Please check your email to confirm your address before signing in.',
        })
    } catch (err: any) {
        console.error('Signup failed:', err)
        if (err?.code === 11000) {
            res.status(409).json({
                error: 'An account with that email already exists. Please sign in or use a different email.',
            })
            return
        }
        res.status(400).json({
            error: 'Could not create account. Please try again later.',
        })
    }
}

// POST /auth/signIn
export async function signIn(req: Request, res: Response) {
    // 🔹 VALIDATE INPUT
    const { value: validatedData, error: validationError } =
        validate<SignInData>(req.body, signInSchema)

    if (validationError) {
        res.status(400).json({
            error:
                validationError.details[0]?.message ||
                'Please check your input and try again.',
        })
        return
    }

    const { email, password } = validatedData

    const member = await Member.findOne({ email })

    if (!member) {
        res.status(401).json({
            error: 'No account found with that email address.',
        })
        return
    }

    if (!member.emailVerified) {
        res.status(401).json({
            error: 'Please confirm your email address before logging in. Check your inbox for a confirmation email.',
        })
        return
    }

    const isPasswordCorrect = await bcrypt.compare(password, member.password)
    if (!isPasswordCorrect) {
        res.status(401).json({
            error: 'Incorrect password. Please try again.',
        })
        return
    }

    const token = generateAccessToken({ id: member._id.toString() })
    const refreshToken = generateRefreshToken({ id: member._id.toString() })

    const { sameSite, secure } = getCookieBaseOptions()

    const memberDto: MemberDto = {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        emailVerified: member.emailVerified,
        authority: member.authority,
        role: member.role as MemberDto['role'],
    }

    const base = { httpOnly: true, secure, sameSite, path: '/' as const }

    res.cookie('token', token, { ...base, maxAge: 2 * ONE_HOUR_MS })
    res.cookie('refreshToken', refreshToken, {
        ...base,
        maxAge: TWO_DAYS_MS,
    })

    res.status(200).json({
        member: memberDto,
        message: 'Signed in successfully.',
    })
}

// POST /auth/signOut
export async function signOut(_req: Request, res: Response) {
    const isProd = process.env.NODE_ENV === 'production'
    const sameSite = isProd ? ('none' as const) : ('lax' as const)
    const secure = isProd

    res.clearCookie('token', { sameSite, secure, path: '/' })
        .clearCookie('refreshToken', { sameSite, secure, path: '/' })
        .status(200)
        .json({ message: 'You have been logged out.' })
}

// POST /auth/confirm-email
export async function confirmEmail(req: Request, res: Response) {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
        res.status(400).json({
            error: 'Invalid or missing confirmation token.',
        })
        return
    }

    const member = await Member.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpires: { $gt: new Date() },
    })

    if (!member) {
        res.status(400).json({
            error: 'Confirmation link is invalid or has expired. Please request a new one.',
        })
        return
    }

    member.emailVerified = true
    member.emailVerificationToken = undefined
    member.emailVerificationTokenExpires = undefined
    await member.save()

    // Optional: redirect or send success response
    // res.status(200).json({ message: 'Email confirmed successfully!' });
    res.redirect(`${process.env.FRONTEND_BASE_URL}/email-confirmed`) // Redirect to frontend confirmation page
}

export async function resendVerification(req: Request, res: Response) {
    const { email } = req.body

    if (!email) {
        res.status(400).json({ error: 'Email is required.' })
        return
    }

    const member = await Member.findOne({ email })

    if (!member) {
        res.status(404).json({
            error: 'No account found with that email address.',
        })
        return
    }

    if (member.emailVerified) {
        res.status(400).json({
            error: 'This email address is already verified. Please sign in.',
        })
        return
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpires = new Date(Date.now() + ONE_DAY_MS) // 24 hrs

    member.emailVerificationToken = verificationToken
    member.emailVerificationTokenExpires = tokenExpires
    await member.save()

    const verificationUrl = `${
        process.env.API_BASE_URL
    }/auth/confirm-email?token=${encodeURIComponent(verificationToken)}`

        await sendEmailTemplate({
            to: member.email,
            subject: 'Resend: Confirm your email address',
            templateId: process.env.MAILERSEND_TEMPLATE_VERIFY_EMAIL!,
            data: {
                name: member.firstName,
                action_url: verificationUrl,
            },
        })
}

// POST /auth/refresh
export function refreshTokenHandler(req: Request, res: Response) {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ error: 'Missing refresh token.' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
            id: string
        }
        const { sameSite, secure } = getCookieBaseOptions()

        const accessToken = generateAccessToken({ id: decoded.id })

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
            maxAge: 2 * ONE_HOUR_MS,
        })

        return res.json({ message: 'Token refreshed' })
    } catch {
        return res
            .status(403)
            .json({ error: 'Refresh session expired. Please sign in again.' })
    }
}

// POST /forgot-password
export async function forgotPassword(req: Request, res: Response) {
    const email = String(req.body.email || '')
        .trim()
        .toLowerCase()

    // Always return the same response (don't leak existence)
    const genericMsg =
        'If that email exists, we sent password reset instructions.'

    if (!email) {
        res.status(200).json({ message: genericMsg })
        return
    }

    try {
        const member = await Member.findOne({ email })

        // If no member, still return generic success
        if (!member) {
            res.status(200).json({ message: genericMsg })
            return
        }

        // Optional: you can require verified email before allowing reset
        // if (!member.emailVerified) {
        //   res.status(200).json({ message: genericMsg })
        //   return
        // }

        // Create raw token (send this to user), store only hash in DB
        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex')

        member.passwordResetTokenHash = tokenHash
        member.passwordResetTokenExpires = new Date(Date.now() + ONE_HOUR_MS)
        await member.save()

        const resetUrl = `${
            process.env.FRONTEND_BASE_URL
        }/reset-password?token=${encodeURIComponent(rawToken)}`

        await sendEmailTemplate({
            to: member.email,
            subject: 'Reset your password',
            templateId: process.env.MAILERSEND_TEMPLATE_RESET_PASSWORD!,
            data: {
                name: member.firstName,
                action_url: resetUrl,
                support_url: `${process.env.FRONTEND_BASE_URL}/support`,
            },
        })

        res.status(200).json({ message: genericMsg })
    } catch (err) {
        console.error('forgotPassword error:', err)
        // Still return generic message to avoid leaking info
        res.status(200).json({ message: genericMsg })
    }
}

// POST /reset-password
export async function resetPassword(req: Request, res: Response) {
    const token = String(req.body.token || '').trim()
    const newPassword = String(req.body.password || '')

    if (!token || !newPassword) {
        res.status(400).json({
            error: 'Reset token and new password are required.',
        })
        return
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const member = await Member.findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpires: { $gt: new Date() },
    })

    if (!member) {
        res.status(400).json({
            error: 'Reset link is invalid or has expired. Please request a new one.',
        })
        return
    }

    member.password = await bcrypt.hash(newPassword, 12)
    member.passwordResetTokenHash = undefined
    member.passwordResetTokenExpires = undefined
    await member.save()

    res.status(200).json({
        message:
            'Your password has been reset successfully. Please sign in with your new password.',
    })
}

// GET /auth/me
// Note: different than members/me because this one uses cookie auth
export async function me(req: Request, res: Response) {
    const token = req.cookies?.token
    if (!token) return res.status(401).json({ error: 'You are not signed in.' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string
        }

        const member = await Member.findById(decoded.id).lean()
        if (!member)
            return res.status(401).json({ error: 'You are not signed in.' })

        const dto: MemberDto = {
            id: String(member._id),
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            emailVerified: member.emailVerified,
            authority: member.authority ?? ['user'],
            role: (member.role as MemberDto['role']) ?? 'family',
        }

        res.json({ member: dto })
    } catch {
        res.status(401).json({ error: 'Unauthorized' })
    }
}
