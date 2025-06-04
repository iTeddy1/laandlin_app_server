const mongoose = require('mongoose')

const User = require('../models/User')
require('dotenv').config()

mongoose.connect(process.env.EXPO_DB_URL).then(async () => {
  console.log('Connected')

  await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: '123456',
  })

  console.log('User added')
  mongoose.disconnect()
})
