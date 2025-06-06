const express = require('express')

const reviewController = require('../controllers/ReviewController.js')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')
const router = express.Router()

router.get('/verified/:productId', reviewController.getVerifiedReviewsByProductId)
router.get(
  '/unverified/:productId',
  validateToken,
  verifyRoles(['admin', 'manager']),
  reviewController.getUnverifiedReviewsByProductId
)
router.get('/product/:productId', reviewController.getReviewByProductId)

router.patch(
  '/verify-many',
  validateToken,
  verifyRoles(['admin', 'manager']),
  reviewController.verifyManyReviews
)
router.get(
  '/unverified',
  validateToken,
  verifyRoles(['admin', 'manager']),
  reviewController.getAllUnverifiedReviews
)
router.get(
  '/verified',
  validateToken,
  verifyRoles(['admin', 'manager']),
  reviewController.getAllVerifiedReviews
)
router.get('/user/', validateToken, reviewController.getReviewsByUserId)

router.get('/:id', validateToken, verifyRoles(['admin', 'manager']), reviewController.getReviewById)
router.patch('/:id', validateToken, reviewController.updateReview)
router.delete('/', validateToken, reviewController.deleteReview)

router.post('/', validateToken, reviewController.addReview)
router.get('/', validateToken, reviewController.getAllReviews)

module.exports = router
