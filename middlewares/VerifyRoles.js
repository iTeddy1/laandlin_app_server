const verifyRoles = permission => {
  return (req, res, next) => {
    if (!req.authenticated) return res.status(401).json({ message: 'User not authenticated' })
    if (!permission.includes(req.role))
      return res.status(401).json({ message: 'User not authorized' })
    next()
  }
}

module.exports = { verifyRoles }
