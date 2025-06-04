const express = require('express')

const router = express.Router()
const controller = require('../controllers/CartController')

router.delete('/clear', controller.clearCart)

router
  .get('/', controller.getCart)
  .patch('/', controller.updateItemInCart)
  .delete('/', controller.removeItemFromCart)
  .post('/', controller.addItemToCart)

module.exports = router
