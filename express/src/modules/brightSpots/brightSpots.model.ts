import mongoose, { Schema } from 'mongoose'

/** `text` is stored ENCRYPTED (utils/fieldCrypto). Never query or index it. */
const BrightSpotSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
        text: { type: String, required: true },
        /** Photo info only; the encrypted bytes live in BrightSpotImage so lists stay light. */
        image: {
            type: new Schema({ width: Number, height: Number, updatedAt: Date }, { _id: false }),
            default: null,
        },
        /** Your drag-and-drop order. New ones go on top (lowest number); ties fall back to newest first. */
        sortOrder: { type: Number, default: 0 },
        seeded: { type: Boolean, default: false },
    },
    { timestamps: true },
)

BrightSpotSchema.index({ userId: 1, sortOrder: 1, createdAt: -1 })

export const BrightSpot = mongoose.model('BrightSpot', BrightSpotSchema, 'brightSpots')

/**
 * Optional photo for one bright spot. `data` is the base64 image ENCRYPTED (utils/fieldCrypto):
 * these can be photos of people the user loves, so they get the same care as entry text.
 * Served only to the owner through GET /api/bright-spots/:id/image. Never logged.
 */
const BrightSpotImageSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
        spotId: { type: Schema.Types.ObjectId, ref: 'BrightSpot', required: true, unique: true },
        mime: { type: String, required: true },
        data: { type: String, required: true },
    },
    { timestamps: true },
)

export const BrightSpotImage = mongoose.model('BrightSpotImage', BrightSpotImageSchema, 'brightSpotImages')
