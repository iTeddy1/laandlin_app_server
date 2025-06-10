const express = require('express')

const reviewController = require('../controllers/ReviewController.js')
const { validateToken } = require('../middlewares/VerifyJWT')
const { verifyRoles } = require('../middlewares/VerifyRoles')
const router = express.Router()

router.get('/product/:productId', reviewController.getReviewByProductId)

router.get('/user/', validateToken, reviewController.getReviewsByUserId)

router.get('/:id', validateToken, verifyRoles(['admin']), reviewController.getReviewById)
router.patch('/:id', validateToken, reviewController.updateReview)
router.delete('/', validateToken, reviewController.deleteReview)

router.post('/', validateToken, reviewController.addReview)
router.get('/', validateToken, reviewController.getAllReviews)

module.exports = router
