import './env'

import * as Sentry from '@sentry/node'
import connectMongoDBSession from 'connect-mongodb-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import helmet from 'helmet'
import mongoose from 'mongoose'

import { ONE_MONTH_MS } from './constants/time'
import { adminRoutes } from './modules/admin'
import { authRoutes } from './modules/auth'
import { categoriesRoutes } from './modules/categories'
import { membersRoutes } from './modules/members'
import { statusRoutes } from './modules/status'
import { worriesRoutes } from './modules/worries'
import { assertFieldKey } from './utils/fieldCrypto'
import { rateLimitMonitor } from './middleware/rateLimitMonitor'

const isProd = process.env.NODE_ENV === 'production'
const sameSite = isProd ? ('none' as const) : ('lax' as const)
const secure = isProd

const MongoDBStore = connectMongoDBSession(session)

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables')
}

// Worry text is encrypted at rest; refuse to boot without a valid key.
assertFieldKey()

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    integrations: [
        Sentry.expressIntegration(),
    ],
})

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !isProd,
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 5 : 100,
    skipSuccessfulRequests: true,
    message: 'Too many login attempts, please try again later.',
})

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: isProd ? 30 : 1000,
    skip: () => !isProd,
})

const app = express()
const store: session.Store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
})

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}))

app.set('trust proxy', 1)

const originList = process.env.CORS_ORIGIN?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const allowedOrigins = isProd
    ? originList || false
    : ['http://localhost:5173', 'http://localhost:3000', ...(originList || [])]

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
)

app.use(generalLimiter)

app.use(
    session({
        name: 'sid',
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: {
            httpOnly: true,
            sameSite,
            secure,
            maxAge: ONE_MONTH_MS,
        },
    }),
)

app.use(rateLimitMonitor)

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/admin', apiLimiter, adminRoutes)
app.use('/api/members', apiLimiter, membersRoutes)
app.use('/api/categories', apiLimiter, categoriesRoutes)
app.use('/api/worries', apiLimiter, worriesRoutes)
app.use('/api', apiLimiter, statusRoutes)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('/api/sentry-test', () => {
    throw new Error('Backend Sentry test error')
})

Sentry.setupExpressErrorHandler(app)

const port = Number(process.env.PORT ?? 3000)

;(async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('mongoose connected')
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    } catch (error) {
        console.error('MongoDB connection error:', error)
        Sentry.captureException(error)
    }
})()
