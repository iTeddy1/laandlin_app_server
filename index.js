const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const uri = process.env.EXPO_DB_URL

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'laandlin_app' })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

const frontendUrl = process.env.FRONTEND_URL.split(', ')

const corsOptions = {
  origin: frontendUrl,
  credentials: true,
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(bodyParser.json())

app.use('/api/products', require('./routes/product'))
app.use('/api/users', require('./routes/user'))
app.use('/api/carts', require('./routes/cart'))
// app.use('/api/tags', require('./routes/tag'))
app.use('/api/categories', require('./routes/category'))
app.use('/api/images', require('./routes/image'))
app.use('/api/reviews', require('./routes/review'))

app.use('/', (req, res) => {
  return res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
