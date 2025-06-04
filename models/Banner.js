const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bannerSchema = new Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Banner', bannerSchema)
