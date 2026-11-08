import express from 'express'

import { requireAdmin } from '../../middleware/requireAdmin'
import { requireAuth } from '../../middleware/requireAuth'
import asyncHandler from '../../utils/asyncHandler'

import { getAdminDashboard } from './admin.controller'

const router = express.Router()

router.get('/dashboard', requireAuth, requireAdmin, asyncHandler(getAdminDashboard))

export default router
