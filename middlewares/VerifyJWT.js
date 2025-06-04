const { sign, verify } = require('jsonwebtoken')
require('dotenv').config()

const createToken = signObject => {
  const accessToken = sign(signObject, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
  return accessToken
}

const validateToken = (req, res, next) => {
  const accessToken = req.headers.authorization?.split('Bearer ')[1]
  if (!accessToken) return res.status(401).json({ message: 'User not authenticated' })

  try {
    verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid token' })
      }
      req.userId = decoded.userId
      req.role = decoded.role
      req.authenticated = true
      return next()
    })
  } catch (err) {
    return res.status(400).json({ message: err })
  }
}

module.exports = { createToken, validateToken }
