const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: {
    _id: { type: String },
    fullName: { type: String },
    address: { type: String },
    county: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  },
  mobile: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['Pay online', 'Cash on delivery', 'Bank transfer'],
    default: 'Pay online',
  },
  orderDate: { type: Date, default: Date.now },
  paymentDueDate: { type: Date, default: () => new Date(Date.now() + 1 * 60 * 60 * 1000) },
  status: {
    type: String,
    enum: [
      'pending', // Initial state when order is created
      'processing', // Payment received, order being prepared
      'shipped', // Order has been shipped
      'delivered', // Order has been delivered
      'completed', // Order fulfilled and closed
      'canceled', // Order canceled by customer/admin
      'refunded', // Payment refunded to customer
      'failed', // Order processing failed
      'on-hold', // Order temporarily held
    ],
    default: 'pending',
  },
  totalAmount: { type: Number, required: true },
  items: [
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
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'failed', 'expired'],
    default: 'unpaid',
  },
  description: { type: String },
})

orderSchema.index({ user: 1, _id: 1 })
orderSchema.index({ user: 1 })
orderSchema.index({ orderDate: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ paymentDueDate: 1 })

module.exports = mongoose.model('Order', orderSchema)
