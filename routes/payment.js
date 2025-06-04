// routes/payment.js
const express = require('express')

const router = express.Router()
const paymentController = require('../controllers/PaymentController')
const { validateToken } = require('../middlewares/VerifyJWT')

router.post('/momo/initiate', validateToken, paymentController.initiateMoMoPayment)
router.post('/momo/callback', paymentController.handleMoMoPaymentResponse)
router.post('/refund', validateToken, paymentController.processRefund)

module.exports = router
