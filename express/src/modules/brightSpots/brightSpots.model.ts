import mongoose, { Schema } from 'mongoose'

/** `text` is stored ENCRYPTED (utils/fieldCrypto). Never query or index it. */
const BrightSpotSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
        text: { type: String, required: true },
        seeded: { type: Boolean, default: false },
    },
    { timestamps: true },
)

BrightSpotSchema.index({ userId: 1, createdAt: -1 })

export const BrightSpot = mongoose.model('BrightSpot', BrightSpotSchema, 'brightSpots')
