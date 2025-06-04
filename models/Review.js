const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  title: { type: String },
  rating: { type: Number },
  comment: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Review', reviewSchema)
