import mongoose, { Schema } from 'mongoose'

const CategorySchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
        slug: { type: String, required: true, trim: true, lowercase: true },
        name: { type: String, required: true, trim: true },
        hint: { type: String, default: '', trim: true },
        icon: { type: String, default: 'LuCircleDot' },
        color: { type: String, default: '#556A70' },
        sortOrder: { type: Number, default: 0 },
        isArchived: { type: Boolean, default: false },
        isDefault: { type: Boolean, default: false },
        seeded: { type: Boolean, default: false },
    },
    { timestamps: true },
)

CategorySchema.index({ userId: 1, slug: 1 }, { unique: true })
CategorySchema.index({ userId: 1, sortOrder: 1 })

export const Category = mongoose.model('Category', CategorySchema, 'categories')
