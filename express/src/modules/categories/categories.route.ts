import express from 'express'

import { requireAdmin } from '../../middleware/requireAdmin'
import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import { createCategory, listCategories, reorderCategories, updateCategory } from './categories.controller'

const router = express.Router()

// Owner-only app: every route needs a signed-in owner account (created with create:admin).
router.use(requireAuth, requireAdmin)

router.get('/', asyncHandler(listCategories))
router.post('/', asyncHandler(createCategory))
// Declared before `/:id` so "reorder" is never read as an id
router.patch('/reorder', asyncHandler(reorderCategories))
router.patch('/:id', asyncHandler(updateCategory))

export default router
