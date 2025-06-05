const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bannerSchema = new Schema({
  banners: {
    type: Array,
    required: true,
  },
  sliders: {
    type: Array,
    required: true,
  },
})

module.exports = mongoose.model('Banner', bannerSchema)
