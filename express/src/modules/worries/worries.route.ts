import express from 'express'

import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import { createWorry, deleteWorry, getWorry, getWorrySummary, listWorries, updateWorry } from './worries.controller'

const router = express.Router()

// Any signed-in member; every query is scoped to req.userId.
router.use(requireAuth)

router.get('/', asyncHandler(listWorries))
// Declared before `/:id` so "summary" is never read as an id
router.get('/summary', asyncHandler(getWorrySummary))
router.get('/:id', asyncHandler(getWorry))
router.post('/', asyncHandler(createWorry))
router.patch('/:id', asyncHandler(updateWorry))
router.delete('/:id', asyncHandler(deleteWorry))

export default router
