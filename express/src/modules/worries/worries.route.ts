import express from 'express'

import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import {
    createWorry,
    deleteWorry,
    findDuplicateWorries,
    findSimilarWorries,
    getWorry,
    getWorrySummary,
    listWorries,
    updateWorry,
} from './worries.controller'

const router = express.Router()

// Any signed-in member; every query is scoped to req.userId.
router.use(requireAuth)

router.get('/', asyncHandler(listWorries))
// Declared before `/:id` so "summary" / "duplicates" are never read as an id
router.get('/summary', asyncHandler(getWorrySummary))
router.get('/duplicates', asyncHandler(findDuplicateWorries))
router.post('/similar', asyncHandler(findSimilarWorries))
router.get('/:id', asyncHandler(getWorry))
router.post('/', asyncHandler(createWorry))
router.patch('/:id', asyncHandler(updateWorry))
router.delete('/:id', asyncHandler(deleteWorry))

export default router
