import mongoose, { Schema } from 'mongoose'

/**
 * description, nextStep, reframe and notes are stored ENCRYPTED (utils/fieldCrypto).
 * Never query or index them; decrypt only in toWorryDto.
 */
const WorrySchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        description: { type: String, required: true },
        isAnxiety: { type: Boolean, default: false },
        isDepression: { type: Boolean, default: false },
        intensity: { type: Number, required: true, min: 1, max: 10 },
        control: { type: String, enum: ['yes', 'partly', 'no'], default: 'partly' },
        status: { type: String, enum: ['active', 'improving', 'resolved'], default: 'active' },
        nextStep: { type: String, default: '' },
        reframe: { type: String, default: '' },
        notes: { type: String, default: '' },
        tags: { type: [String], default: [] },
        resolvedAt: { type: Date, default: null },
        seeded: { type: Boolean, default: false },
    },
    { timestamps: true },
)

WorrySchema.index({ userId: 1, status: 1, createdAt: -1 })
WorrySchema.index({ userId: 1, categoryId: 1 })

export const Worry = mongoose.model('Worry', WorrySchema, 'worries')
