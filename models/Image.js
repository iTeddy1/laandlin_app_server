const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
  public_id: { type: String, required: true, index: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Image', ImageSchema)
