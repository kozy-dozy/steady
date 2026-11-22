import express from 'express'

import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import { createBrightSpot, deleteBrightSpot, listBrightSpots, updateBrightSpot } from './brightSpots.controller'

const router = express.Router()

// Any signed-in member; every query is scoped to req.userId.
router.use(requireAuth)

router.get('/', asyncHandler(listBrightSpots))
router.post('/', asyncHandler(createBrightSpot))
router.patch('/:id', asyncHandler(updateBrightSpot))
router.delete('/:id', asyncHandler(deleteBrightSpot))

export default router
