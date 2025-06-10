const express = require('express')

const router = express.Router()
const controller = require('../controllers/UserController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.post('/login', controller.userLogin)
router.post('/register', controller.userRegister)
router.post('/logout', validateToken, controller.userLogout)
router.patch('/', validateToken, controller.updateUser)
router.post('/add-address', validateToken, controller.addAddress)
router.get('/me', validateToken, controller.getUser)


// admin router
router.patch('/:userId', validateToken, verifyRoles(['admin']), controller.updateRole)
router.get('/', validateToken, verifyRoles(['admin']), controller.getAllUsers)

module.exports = router
