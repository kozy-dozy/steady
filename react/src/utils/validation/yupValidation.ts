import * as Yup from 'yup'

import { US_STATE_OPTIONS } from '@/constants/states.constant'

const NAME_LETTERS_ONLY = /^[A-Za-z]+$/

const digitsOnly = (v: string) => String(v ?? '').replace(/\D/g, '')

const strongPassword = Yup.string()
    .required('Enter your new password')
    .min(8, 'Must be at least 8 characters')
    .matches(/[0-9]/, 'Must include at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must include at least one special character')

export const yupFields = {
    firstName: Yup.string()
        .trim()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be 50 characters or less')
        .matches(NAME_LETTERS_ONLY, 'First name must contain letters only'),

    lastName: Yup.string()
        .trim()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be 50 characters or less')
        .matches(NAME_LETTERS_ONLY, 'Last name must contain letters only'),

    phone: Yup.string()
        .transform((v) => digitsOnly(v))
        .test('phone-10', 'Enter a valid 10-digit phone number', (val) => {
            const d = digitsOnly(val ?? '')
            return d.length === 0 || d.length === 10
        })
        .default(''),

    email: Yup.string()
        .transform((v) => String(v ?? '').trim())
        .required('Email is required')
        .email('Email is not valid.')
        .max(254, 'Email is too long'),

    avatar: Yup.string().optional().default(''),

    avatarFile: Yup.mixed<File>()
        .nullable()
        .optional()
        .defined()
        .default(null)
        .test('fileType', 'Please upload a PNG or JPEG.', (value) => {
            if (!value) return true
            return value instanceof File
                ? ['image/jpeg', 'image/png'].includes(value.type)
                : true
        }),

    // --- Password presets ---
    passwordRequired: Yup.string().trim().required('Password is required'),

    currentPassword: Yup.string().trim().default(''),

    // Use this for reset/signup flows (always required + strong)
    newPasswordRequiredStrong: strongPassword,

    // Use this for change-password flows (optional unless currentPassword is filled)
    newPasswordStrongWhenChanging: Yup.string()
        .trim()
        .when('currentPassword', {
            is: (v: unknown) => String(v ?? '').trim().length > 0,
            then: () => strongPassword,
            otherwise: (schema) => schema.optional().default(''),
        }),

    // Confirm password for forms that include it
    confirmNewPasswordMatches: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
        .required('Confirm your new password'),

    confirmPasswordMatches: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Confirm your password'),

    addressLine1: Yup.string().trim().required('Address line 1 is required'),
    addressLine2: Yup.string().trim().optional().default(''),
    addressCity: Yup.string().trim().required('City is required'),

    addressState: Yup.string()
        .trim()
        .oneOf(
            US_STATE_OPTIONS.map((s) => s.value),
            'Select a state',
        )
        .required('State is required'),

    addressZip: Yup.string()
        .trim()
        .matches(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP (e.g. 27410)')
        .required('ZIP is required'),

    addressCountry: Yup.string().trim().default('US'),
    isDefault: Yup.boolean().default(false),
    instructions: Yup.string().trim().optional().default(''),

    nameOnCard: Yup.string().trim().required('Name on card is required'),

    cardNumber: Yup.string()
        .required('Card number is required')
        .matches(/^\d{12,16}$/, 'Enter 12-16 digits'),

    cardExpiration: Yup.string()
        .required('Expiration is required')
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY'),

    cardCvc: Yup.string()
        .required('CVC is required')
        .matches(/^\d{3,4}$/, 'Use 3-4 digits'),

    message: Yup.string()
        .trim()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message is too long.'),

    label: Yup.string().trim().default(''),
} as const
