const Cart = require('../models/Cart')
const Product = require('../models/Product')

const getCart = async (req, res) => {
  const id = req.cookies.cart
  try {
    if (id === undefined) {
      const cart = await Cart.create({ items: [] })
      res.cookie('cart', cart._id, {
        maxAge: 2592000000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      return res.status(201).json({ cart })
    }
    const availableCart = await Cart.findById(id)
    const itemIds = availableCart.items.map(item => item.productId)
    const availableItems = await Product.find(
      { _id: { $in: itemIds } },
      { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
    )
    const mappedItems = {}
    availableItems.forEach(item => {
      mappedItems[item._id] = item
    })
    let subTotal = 0
    const items = []
    availableCart.items.forEach(item => {
      if (mappedItems[item.productId]) {
        const newColor = mappedItems[item.productId].colors.find(
          color => color.color === item.color
        )
        const newSize =
          mappedItems[item.productId].sizes.find(size => size.size === item.size) || ''
        if (newColor && (newSize || item.size === '')) {
          const finalPrice =
            mappedItems[item.productId].sizes.find(size => size.size === item.size)?.salePrice ||
            mappedItems[item.productId].salePrice
          items.push({
            _id: item._id,
            productId: item.productId,
            name: mappedItems[item.productId].name,
            price: mappedItems[item.productId].price,
            salePrice: finalPrice,
            color: newColor,
            size: newSize,
            quantity: item.quantity,
            slug: mappedItems[item.productId].slug,
          })
          subTotal += finalPrice * item.quantity
        }
      }
    })
    availableCart.items = availableCart.items.filter(item => {
      return mappedItems[item.productId] != undefined
    })
    await availableCart.save()
    return res.status(200).json({ cart: items, subTotal })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const addItemToCart = async (req, res) => {
  const { productId, size, color, quantity } = req.body
  const id = req.cookies.cart
  try {
    const product = await Product.findById(productId)
    if (product === null) {
      return res.status(404).json({ message: 'Product not found' })
    }
    if (id === undefined) {
      const cart = await Cart.create({ items: [] })
      res.cookie('cart', cart._id, {
        maxAge: 2592000000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
    }
    const cart = await Cart.findById(id)
    const existingItem = cart.items.find(
      item => item.productId === productId && item.size === size && item.color === color
    )
    if (!existingItem) {
      cart.items.unshift({
        productId,
        quantity,
        size,
        color,
        price: product.price,
      })
      cart.subTotal += (product.sizes.salePrice || product.salePrice) * quantity
    } else {
      existingItem.quantity += quantity
      cart.subTotal += (product.sizes.salePrice || product.salePrice) * quantity
    }
    cart.updatedAt = Date.now()
    const updatedCart = await cart.save()
    const itemIds = updatedCart.items.map(item => item.productId)
    const availableItems = await Product.find(
      { _id: { $in: itemIds } },
      { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
    )
    const mappedItems = {}
    availableItems.forEach(item => {
      mappedItems[item._id] = item
    })
    let subTotal = 0
    const items = []
    updatedCart.items.forEach(item => {
      if (mappedItems[item.productId]) {
        const newColor = mappedItems[item.productId].colors.find(
          color => color.color === item.color
        )
        const newSize =
          mappedItems[item.productId].sizes.find(size => size.size === item.size) || ''
        if (newColor && (newSize || item.size === '')) {
          const finalPrice =
            mappedItems[item.productId].sizes.find(size => size.size === item.size)?.salePrice ||
            mappedItems[item.productId].salePrice
          items.push({
            _id: item._id,
            productId: item.productId,
            name: mappedItems[item.productId].name,
            price: mappedItems[item.productId].price,
            salePrice: finalPrice,
            color: newColor,
            size: newSize,
            quantity: item.quantity,
            slug: mappedItems[item.productId].slug,
          })
          subTotal += finalPrice * item.quantity
        }
      }
    })
    return res.status(200).json({ message: 'Item added to cart', cart: items, subTotal })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const updateItemInCart = async (req, res) => {
  const { itemId, quantity } = req.body
  const id = req.cookies.cart
  if (!itemId) {
    return res.status(400).json({ message: 'Item ID is required' })
  }
  try {
    const cart = await Cart.findById(id)
    const existingItem = cart.items.find(item => item._id === itemId)
    if (existingItem === undefined) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }
    cart.subTotal += (quantity - existingItem.quantity) * existingItem.price
    existingItem.quantity = quantity
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item._id != itemId)
    }
    cart.updatedAt = Date.now()
    const updatedCart = await cart.save()
    const itemIds = updatedCart.items.map(item => item.productId)
    const availableItems = await Product.find(
      { _id: { $in: itemIds } },
      { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
    )
    const mappedItems = {}
    availableItems.forEach(item => {
      mappedItems[item._id] = item
    })
    let subTotal = 0
    const items = []
    updatedCart.items.forEach(item => {
      if (mappedItems[item.productId]) {
        const newColor = mappedItems[item.productId].colors.find(
          color => color.color === item.color
        )
        const newSize =
          mappedItems[item.productId].sizes.find(size => size.size === item.size) || ''
        if (newColor && (newSize || item.size === '')) {
          const finalPrice =
            mappedItems[item.productId].sizes.find(size => size.size === item.size)?.salePrice ||
            mappedItems[item.productId].salePrice
          items.push({
            _id: item._id,
            productId: item.productId,
            name: mappedItems[item.productId].name,
            price: mappedItems[item.productId].price,
            salePrice: finalPrice,
            color: newColor,
            size: newSize,
            quantity: item.quantity,
            slug: mappedItems[item.productId].slug,
          })
          subTotal += finalPrice * item.quantity
        }
      }
    })
    return res.status(200).json({ message: 'Item updated in cart', cart: items, subTotal })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const removeItemFromCart = async (req, res) => {
  const { itemId } = req.body
  const id = req.cookies.cart
  if (!itemId) {
    return res.status(400).json({ message: 'Item ID is required' })
  }
  if (!id) {
    return res.status(400).json({ message: 'Cart ID is required' })
  }
  try {
    const cart = await Cart.findById(id)
    const existingItem = cart.items.find(item => item._id === itemId)
    if (existingItem === undefined) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }
    cart.subTotal -= existingItem.price * existingItem.quantity
    cart.items = cart.items.filter(item => item._id != itemId)
    cart.updatedAt = Date.now()
    const updatedCart = await cart.save()
    const itemIds = updatedCart.items.map(item => item.productId)
    const availableItems = await Product.find(
      { _id: { $in: itemIds } },
      { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
    )
    const mappedItems = {}
    availableItems.forEach(item => {
      mappedItems[item._id] = item
    })
    let subTotal = 0
    const items = []
    updatedCart.items.forEach(item => {
      if (mappedItems[item.productId]) {
        const newColor = mappedItems[item.productId].colors.find(
          color => color.color === item.color
        )
        const newSize =
          mappedItems[item.productId].sizes.find(size => size.size === item.size) || ''
        if (newColor && (newSize || newSize.length === 0)) {
          const finalPrice =
            mappedItems[item.productId].sizes.find(size => size.size === item.size)?.salePrice ||
            mappedItems[item.productId].salePrice
          items.push({
            _id: item._id,
            productId: item.productId,
            name: mappedItems[item.productId].name,
            price: mappedItems[item.productId].price,
            salePrice: finalPrice,
            color: newColor,
            size: newSize,
            quantity: item.quantity,
            slug: mappedItems[item.productId].slug,
          })
          subTotal += finalPrice * item.quantity
        }
      }
    })
    return res.status(200).json({ message: 'Item removed from cart', cart: items, subTotal })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const clearCart = async (req, res) => {
  const id = req.cookies.cart
  try {
    const cart = await Cart.findById(id)
    cart.items = []
    cart.subTotal = 0
    cart.updatedAt = Date.now()
    const updatedCart = await cart.save()
    return res.status(200).json({ message: 'Cart cleared', cart: updatedCart })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getCart,
  addItemToCart,
  updateItemInCart,
  removeItemFromCart,
  clearCart,
}
