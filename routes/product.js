const express = require('express')

const router = express.Router()
const controller = require('../controllers/ProductController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.post('/', validateToken, verifyRoles(['admin']), controller.addProduct)
router.patch('/:id', validateToken, verifyRoles(['admin']), controller.updateProduct)
router.delete('/:id', validateToken, verifyRoles(['admin']), controller.deleteProduct)

router.get('/:id', controller.getProductById)

router.delete('/', validateToken, verifyRoles(['admin']), controller.deleteManyProducts)

router.get('/', controller.getAllProducts)

module.exports = router
