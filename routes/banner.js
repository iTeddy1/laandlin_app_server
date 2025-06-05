const router = require('express').Router()

const controller = require('../controllers/BannerController')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')

// Banner routes
router.get('/banners', controller.getAllBanners)
router.get('/banners/:id', controller.getBannerById)
router.post('/banners', validateToken, verifyRoles(['admin', 'manage']), controller.addBanner)
router.patch(
  '/banners/:id',
  validateToken,
  verifyRoles(['admin', 'manager'], controller.updateBanner)
)
router.delete(
  '/banners/:id',
  validateToken,
  verifyRoles(['admin', 'manager'], controller.deleteBanner)
)

// Slider routes
router.get('/sliders', controller.getAllSliders)
router.get('/sliders/:id', controller.getSliderById)
router.post('/sliders', validateToken, verifyRoles(['admin', 'manager']), controller.addSlider)
router.patch(
  '/sliders/:id',
  validateToken,
  verifyRoles(['admin', 'manager']),
  controller.updateSlider
)

router.delete(
  '/sliders/:id',
  validateToken,
  verifyRoles(['admin', 'manage']),
  controller.deleteSlider
)

module.exports = router
