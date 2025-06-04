const express = require('express')

const router = express.Router()
const controller = require('../controllers/WishlistController')

router.delete('/clear', controller.clearWishlist)

router
  .get('/', controller.getWishlist)
  .post('/', controller.addItemToWishlist)
  .delete('/', controller.removeItemFromWishlist)

module.exports = router
