const express = require('express')
const router = express.Router()

const controller = require('../controllers/DiscountController.js')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.get('/', validateToken, verifyRoles(['admin', 'manager']), controller.getAllDiscounts)
router.get('/:code', validateToken, verifyRoles(['admin', 'manager']), controller.getDiscountByCode)
router.post('/', validateToken, verifyRoles(['admin', 'manager']), controller.addDiscount)
router.patch('/:code', validateToken, verifyRoles(['admin', 'manager']), controller.updateDiscount)
router.delete('/:code', validateToken, verifyRoles(['admin', 'manager']), controller.deleteDiscount)

module.exports = router
