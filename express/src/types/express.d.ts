import 'express-session'

declare global {
    namespace Express {
        interface Request {
            /**
             * User ID extracted from JWT token by requireAuth middleware
             */
            userId?: string

            /**
             * Full user object (if populated by other middleware)
             */
            user?: {
                id: string
                email?: string
                [key: string]: any
            }

            /**
             * Session ID from express-session
             */
            sessionID?: string
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        /**
         * User ID stored in session
         */
        userId?: string

        /**
         * Member ID stored in session
         */
        memberId?: string

        /**
         * Cart initialization flag
         */
        cartInit?: boolean
    }
}

export {}
