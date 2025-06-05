const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  mobile: { type: String },
  address: {
    id: { type: String },
    fullName: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    county: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

userSchema.index({ email: 1 })
userSchema.index({ name: 1 })

module.exports = mongoose.model('User', userSchema)
