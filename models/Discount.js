const mongoose = require('mongoose')
const Schema = mongoose.Schema

const discountSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  discount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Discount', discountSchema)
