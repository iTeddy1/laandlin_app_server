module.exports = (req, res, next) => {
  console.log(
    `[${new Date().toLocaleDateString()}] ${req.method} to ${req.path} timestamp: ${new Date().toLocaleTimeString()}`
  )
  next()
}
