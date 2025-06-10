const express = require('express')

const router = express.Router()
const orderController = require('../controllers/OrderController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.get('/user/:id', validateToken, orderController.getUserOrderById)
router.get('/user', validateToken, orderController.getAllOrdersByUserId)
router.get('/:id', validateToken, verifyRoles(['admin']), orderController.getOrderById)

router.post('/', validateToken, orderController.createOrder)
router.get('/', validateToken, verifyRoles(['admin']), orderController.getAllOrders)

module.exports = router
