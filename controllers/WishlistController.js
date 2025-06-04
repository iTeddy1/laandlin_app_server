const Product = require('../models/Product')
const Wishlist = require('../models/Wishlist')

const getWishlist = async (req, res) => {
  const id = req.cookies.wishlist

  if (id === undefined) {
    try {
      const wishlist = await Wishlist.create({ items: [] })
      console.log(wishlist)
      res.cookie('wishlist', wishlist._id, {
        maxAge: 2592000000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      return res.status(201).json({ wishlist })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  try {
    const availableWishlist = await Wishlist.findById(id)
    const availableItems = await Product.find(
      { _id: { $in: availableWishlist.items } },
      { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
    )
    res.status(200).json({ wishlist: availableItems })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const clearWishlist = async (req, res) => {
  const id = req.cookies.wishlist
  try {
    const wishlist = await Wishlist.findById(id)
    wishlist.items = []
    await wishlist.save()
    res.status(200).json({ message: 'Cleared' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const removeItemFromWishlist = async (req, res) => {
  const { productId } = req.body
  const id = req.cookies.wishlist
  try {
    const wishlist = await Wishlist.findById(id)
    if (!wishlist) return res.status(400).json({ message: 'Product not available' })
    const updateItems = wishlist.items.filter(itemId => itemId !== productId)
    wishlist.items = updateItems
    await wishlist.save()
    const availableItems = await Product.find(
      { _id: { $in: wishlist.items } },
      { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
    )
    res.status(200).json({ message: 'Deleted', wishlist: availableItems })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const addItemToWishlist = async (req, res) => {
  const { productId } = req.body
  const id = req.cookies.wishlist
  try {
    const wishlist = await Wishlist.findById(id)
    if (wishlist.items.find(itemId => itemId === productId)) {
      return res.status(400).json({ message: 'Product already exist' })
    } else {
      wishlist.items.push(productId)
      await wishlist.save()
      const availableItems = await Product.find(
        { _id: { $in: wishlist.items } },
        { _id: 1, name: 1, price: 1, salePrice: 1, colors: 1, sizes: 1, slug: 1 }
      )
      res.status(200).json({ message: 'Added', wishlist: availableItems })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  getWishlist,
  clearWishlist,
  removeItemFromWishlist,
  addItemToWishlist,
}
