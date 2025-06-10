const router = require('express').Router()

const controller = require('../controllers/CategoryController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.get('/name/:name', controller.getCategoryByName)
router.patch(
  '/name/:name',
  validateToken,
verifyRoles(['admin']),
  controller.updateCategory
)
router.delete('/:id', validateToken, verifyRoles(['admin']), controller.deleteCategory)
router.get('/:id', controller.getCategoryById)
router.post('/', validateToken, verifyRoles(['admin']), controller.addCategory)
router.get('/', controller.getAllCategories)

module.exports = router
