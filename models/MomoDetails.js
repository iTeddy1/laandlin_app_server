const mongoose = require('mongoose')

const momoDetailsSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  orderInfo: { type: String }, // Details sent to MoMo
  payType: { type: String, enum: ['qr', 'wallet'], required: true },
  signature: { type: String, required: true }, // To verify transaction integrity
  orderId: { type: String, required: true }, // MoMo's order ID
  requestId: { type: String, required: true }, // Unique request ID
})

momoDetailsSchema.index({ transaction: 1 })

module.exports = mongoose.model('MoMoDetails', momoDetailsSchema)
