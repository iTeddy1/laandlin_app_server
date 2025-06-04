const router = require('express').Router()

const controller = require('../controllers/CategoryController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.get('/name/:name', controller.getCategoryByName)
router.patch(
  '/name/:name',
  validateToken,
  verifyRoles(['admin', 'manager']),
  controller.updateCategory
)
router.delete(
  '/name/:name',
  validateToken,
  verifyRoles(['admin', 'manager']),
  controller.deleteCategory
)
router.get('/:id', controller.getCategoryById)
router.post('/', validateToken, verifyRoles(['admin', 'manager']), controller.addCategory)
router.get('/', controller.getAllCategories)

module.exports = router
