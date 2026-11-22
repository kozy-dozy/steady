import express from 'express'

import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import {
    createBrightSpot,
    deleteBrightSpot,
    deleteBrightSpotImage,
    getBrightSpotImage,
    listBrightSpots,
    putBrightSpotImage,
    reorderBrightSpots,
    updateBrightSpot,
} from './brightSpots.controller'

const router = express.Router()

// Any signed-in member; every query is scoped to req.userId.
router.use(requireAuth)

router.get('/', asyncHandler(listBrightSpots))
router.post('/', asyncHandler(createBrightSpot))
// Declared before `/:id` so "reorder" is never read as an id
router.patch('/reorder', asyncHandler(reorderBrightSpots))
router.patch('/:id', asyncHandler(updateBrightSpot))
router.delete('/:id', asyncHandler(deleteBrightSpot))
router.get('/:id/image', asyncHandler(getBrightSpotImage))
router.put('/:id/image', asyncHandler(putBrightSpotImage))
router.delete('/:id/image', asyncHandler(deleteBrightSpotImage))

export default router
