import mongoose from 'mongoose'

export const AddressSchema = new mongoose.Schema(
    {
        label: { type: String, trim: true, default: '' },
        line1: { type: String, required: true, trim: true },
        line2: { type: String, trim: true, default: '' },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
        zip: { type: String, required: true, trim: true },
        country: { type: String, trim: true, default: 'US' },
        instructions: { type: String, trim: true, default: '' },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true },
)

const MemberSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['family', 'couple', 'solo', 'group', 'admin'],
            default: 'family',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationTokenExpires: {
            type: Date,
        },
        password: {
            type: String,
            required: true,
        },
        authority: {
            type: [String],
            enum: ['user', 'admin'],
            default: ['user'],
        },
        passwordResetTokenHash: {
            type: String,
        },
        passwordResetTokenExpires: {
            type: Date,
        },
        phone: {
            type: String,
            default: '',
        },
        shippingAddresses: {
            type: [AddressSchema],
            default: [],
        },
        defaultShippingAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        billingAddresses: {
            type: [AddressSchema],
            default: [],
        },
        defaultBillingAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    { timestamps: true },
)

export default mongoose.model('Member', MemberSchema, 'members')
