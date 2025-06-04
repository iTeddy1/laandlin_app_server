const mongoose = require('mongoose')
const Schema = mongoose.Schema

const collectionSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  shortDescription: { type: String, required: true },
  headline: { type: String, required: true },
  description: { type: String },
  mainImageUrl: { type: String, required: true },
  galleryImageUrls: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Collection', collectionSchema)
