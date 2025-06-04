const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wishlistSchema = new Schema({
  items: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Wishlist', wishlistSchema)
