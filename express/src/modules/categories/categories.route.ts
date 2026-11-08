import express from 'express'

import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import { createCategory, listCategories, reorderCategories, updateCategory } from './categories.controller'

const router = express.Router()

// Any signed-in member; every query is scoped to req.userId.
router.use(requireAuth)

router.get('/', asyncHandler(listCategories))
router.post('/', asyncHandler(createCategory))
// Declared before `/:id` so "reorder" is never read as an id
router.patch('/reorder', asyncHandler(reorderCategories))
router.patch('/:id', asyncHandler(updateCategory))

export default router
