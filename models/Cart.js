const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      color: { type: String },
      size: { type: String },
      price: { type: Number },
      quantity: { type: Number },
    },
  ],
  subTotal: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Cart', cartSchema)
