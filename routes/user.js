const express = require('express')

const router = express.Router()
const controller = require('../controllers/UserController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

router.post('/login', controller.userLogin)
router.post('/register', controller.userRegister)
router.post('/logout', validateToken, controller.userLogout)
router.post('/reset-password', validateToken, controller.resetPassword)
router.patch('/', validateToken, controller.updateUser)
router.patch('/update-password', validateToken, controller.updatePassword)
router.delete('/delete-address', validateToken, controller.deleteAddress)
router.post('/add-address', validateToken, controller.addAddress)
router.get('/me', validateToken, controller.getUser)

router.post('/google-login', controller.googleLogin)

// admin router
router.patch('/:userId', validateToken, verifyRoles(['admin']), controller.updateRole)
router.delete('/:userId', validateToken, verifyRoles(['admin']), controller.deleteUser)
router.get('/', validateToken, verifyRoles(['admin']), controller.getAllUsers)

module.exports = router
