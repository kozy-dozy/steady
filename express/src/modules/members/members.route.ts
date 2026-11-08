import express from 'express'

import asyncHandler from '../../../src/utils/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'
import { requireAuth } from '../../middleware/requireAuth'

import {
    addShippingAddress,
    deleteShippingAddress,
    getShippingAddresses,
    setDefaultShippingAddress,
    updateShippingAddress,
    addBillingAddress,
    deleteBillingAddress,
    getBillingAddresses,
    setDefaultBillingAddress,
    updateBillingAddress,
} from './addresses/addresses.controller'
import {
    getMembers,
    getMemberById,
    updateMemberById,
    deleteMemberById,
    getMe,
    updateMe,
    updateMyPassword,
} from './members.controller'

const router = express.Router()

/**
 * Self-service (any logged-in user)
 */
router.get('/me', requireAuth, asyncHandler(getMe))
router.patch('/me', requireAuth, asyncHandler(updateMe))
router.put('/me', requireAuth, asyncHandler(updateMe))
router.put('/me/password', requireAuth, asyncHandler(updateMyPassword))

// Shipping addresses
router.get('/me/addresses/shipping', requireAuth, asyncHandler(getShippingAddresses))
router.post('/me/addresses/shipping', requireAuth, asyncHandler(addShippingAddress))
router.put('/me/addresses/shipping/:addressId', requireAuth, asyncHandler(updateShippingAddress))
router.delete('/me/addresses/shipping/:addressId', requireAuth, asyncHandler(deleteShippingAddress))
router.post('/me/addresses/shipping/:addressId/default', requireAuth, asyncHandler(setDefaultShippingAddress))

// Billing addresses
router.get('/me/addresses/billing', requireAuth, asyncHandler(getBillingAddresses))
router.post('/me/addresses/billing', requireAuth, asyncHandler(addBillingAddress))
router.put('/me/addresses/billing/:addressId', requireAuth, asyncHandler(updateBillingAddress))
router.delete('/me/addresses/billing/:addressId', requireAuth, asyncHandler(deleteBillingAddress))
router.post('/me/addresses/billing/:addressId/default', requireAuth, asyncHandler(setDefaultBillingAddress))
/**
 * Admin-only (manage users)
 */
router.post('/', requireAuth, requireAdmin, asyncHandler(getMembers))
router.get('/:id', requireAuth, requireAdmin, asyncHandler(getMemberById))
router.put('/:id', requireAuth, requireAdmin, asyncHandler(updateMemberById))
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteMemberById))

export default router
