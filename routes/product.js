const express = require('express')

const router = express.Router()
const controller = require('../controllers/ProductController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

// Specific routes first
router.get('/price-range', controller.getProductsByPriceRange)
router.get('/recent', controller.getRecentlyAddedProducts)
router.get('/popular', controller.getPopularProducts)
router.get('/category/:name', controller.getProductsByCategory)
router.get('/sizes', controller.getAllSizes)
router.get('/colors', controller.getAllColors)
router.get('/sku/:sku', controller.getProductBySKU)
router.get(
  '/low-stock',
  validateToken,
  verifyRoles(['admin', 'manager']),
  controller.getLowStockProducts
)
router.get('/slug/:slug', controller.getProductBySlug)

router.get('/related/:productId', controller.getRelatedProducts)

// Routes that modify the product data (admin/manager only)
router.post('/', validateToken, verifyRoles(['admin', 'manager']), controller.addProduct)
router.patch('/:id', validateToken, verifyRoles(['admin', 'manager']), controller.updateProduct)
router.delete('/:id', validateToken, verifyRoles(['admin', 'manager']), controller.deleteProduct)

// Generic product routes (id-based routes should be near the end)
router.get('/:id', controller.getProductById)

router.delete('/', validateToken, verifyRoles(['admin', 'manager']), controller.deleteManyProducts)
// Base route (get all products)
router.get('/', controller.getAllProducts)

module.exports = router
