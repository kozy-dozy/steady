import express from 'express'

import { requireAdmin } from '../../middleware/requireAdmin'
import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import { createWorry, deleteWorry, getWorry, getWorrySummary, listWorries, updateWorry } from './worries.controller'

const router = express.Router()

// Owner-only app: every route needs a signed-in owner account. Data is scoped to req.userId.
router.use(requireAuth, requireAdmin)

router.get('/', asyncHandler(listWorries))
// Declared before `/:id` so "summary" is never read as an id
router.get('/summary', asyncHandler(getWorrySummary))
router.get('/:id', asyncHandler(getWorry))
router.post('/', asyncHandler(createWorry))
router.patch('/:id', asyncHandler(updateWorry))
router.delete('/:id', asyncHandler(deleteWorry))

export default router
