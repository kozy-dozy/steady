import express from 'express'

import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import {
    addActionItem,
    createWorry,
    deleteActionItem,
    deleteWorry,
    findDuplicateWorries,
    findSimilarWorries,
    getWorry,
    getWorrySummary,
    listFocusWorries,
    listWorries,
    setWorryFocus,
    updateActionItem,
    updateWorry,
} from './worries.controller'

const router = express.Router()

// Any signed-in member; every query is scoped to req.userId.
router.use(requireAuth)

router.get('/', asyncHandler(listWorries))
// Declared before `/:id` so "summary" / "duplicates" are never read as an id
router.get('/summary', asyncHandler(getWorrySummary))
router.get('/focus', asyncHandler(listFocusWorries))
router.get('/duplicates', asyncHandler(findDuplicateWorries))
router.post('/similar', asyncHandler(findSimilarWorries))
router.get('/:id', asyncHandler(getWorry))
router.post('/', asyncHandler(createWorry))
router.patch('/:id', asyncHandler(updateWorry))
router.delete('/:id', asyncHandler(deleteWorry))
router.patch('/:id/focus', asyncHandler(setWorryFocus))
router.post('/:id/action-items', asyncHandler(addActionItem))
router.patch('/:id/action-items/:itemId', asyncHandler(updateActionItem))
router.delete('/:id/action-items/:itemId', asyncHandler(deleteActionItem))

export default router
