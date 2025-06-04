const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImageCacheSchema = new Schema({
  public_id: { type: String, required: true, ref: 'Image' },
  imageId: { type: Schema.Types.ObjectId, required: true, ref: 'Image' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('ImageCache', ImageCacheSchema)
