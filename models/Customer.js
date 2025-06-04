const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String },
      slug: { type: String },
      color: { type: Object },
      size: { type: String },
      price: { type: Number },
      salePrice: { type: Number },
      category: { type: String },
      quantity: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Customer', customerSchema)
