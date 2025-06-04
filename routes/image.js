const express = require('express')
const router = express.Router()
const multer = require('multer')

const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

const storage = multer.memoryStorage()
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage,
})

const controller = require('../controllers/ImageController')

router.get('/', validateToken, verifyRoles(['admin', 'manager']), controller.getAllImagesUrl)
router.get('/:id', controller.getImageById)
router.post(
  '/upload',
  validateToken,
  verifyRoles(['admin', 'manager']),
  upload.single('image'),
  controller.uploadImage
)
router.post(
  '/upload-many',
  validateToken,
  verifyRoles(['admin', 'manager']),
  upload.array('images', 10),
  controller.uploadManyImages
)
router.delete('/:id', validateToken, verifyRoles(['admin', 'manager']), controller.deleteImage)
router.delete('/', validateToken, verifyRoles(['admin', 'manager']), controller.deleteManyImages)

module.exports = router
