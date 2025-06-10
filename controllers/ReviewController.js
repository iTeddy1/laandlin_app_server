const Review = require('../models/Review')

const addReview = async (req, res) => {
  try {
    const userId = req.userId
    const { productId, title, rating, comment } = req.body

    if (!productId || !title || !rating || !comment)
      return res.status(400).json({ message: 'Please fill all fields' })
    const existingReview = await Review.findOne({ userId, productId })
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists' })
    }

    const newReview = await Review.create({
      user: userId,
      product: productId,
      title,
      rating,
      comment,
    })
    res.status(201).json({ message: 'Review added successfully', newReview })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()

    res.status(200).json({ data: { message: 'Reviews retrieved successfully', reviews } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


const getReviewById = async (req, res) => {
  try {
    const id = req.params.id
    const review = await Review.findById(id)
      .populate('user', 'username email mobile')
      .populate('product', 'name slug')
    if (review == null) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.status(200).json({ message: 'Review retrieved successfully', review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getReviewByProductId = async (req, res) => {
  const { productId } = req.params
  console.log('Product ID:', productId)
  try {
    const reviews = await Review.find({ product: productId })
      .populate('user', 'username email mobile')
      .populate('product', 'name slug')

    res.status(200).json({ data: { message: 'Reviews retrieved successfully', reviews } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getReviewsByUserId = async (req, res) => {
  const userId = req.userId
  try {
    const reviews = await Review.find({ user: userId })
      .populate('user', 'username email mobile')
      .populate('product', 'name slug')
    res.status(200).json({ data: { message: 'Reviews retrieved successfully', reviews } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Update a review
const updateReview = async (req, res) => {
  try {
    const id = req.params.id
    const { userId, productId, title, rating, comment, verified } = req.body
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { userId, productId, rating, comment, verified, title },
      { new: true }
    )
      .populate('user', 'username email mobile')
      .populate('product', 'name slug')
    if (updatedReview == null) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.status(200).json({ message: 'Review updated successfully', updatedReview })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteReview = async (req, res) => {
  try {
    const ids = req.body.ids
    const review = await Review.deleteMany({ _id: { $in: ids } })
    if (review == null) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.status(200).json({ message: 'Review deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  addReview,
  getAllReviews,
  getReviewById,
  getReviewByProductId,
  updateReview,
  deleteReview,
  getReviewsByUserId,
}
