const mongoose = require('mongoose')

const Product = require('../models/Product')

const DEFAULT_LIMIT = 30

const getPagination = (page, limit) => {
  const limitNumber = parseInt(limit, 10) || DEFAULT_LIMIT
  const pageNumber = parseInt(page, 10) || 1
  const skip = (pageNumber - 1) * limitNumber
  return { skip, limitNumber }
}

const getAllProducts = async (req, res) => {
  const {
    page,
    limit,
    sort,
    query,
    category,
    min,
    maxPrice,
    collection,
    status,
    availability,
    sizes,
    colors,
  } = req.query

  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const mongoQuery = {}
    if (query) {
      mongoQuery.name = { $regex: query, $options: 'i' }
    }
    if (category) {
      // Support single ID or comma-separated IDs
      const categoryIds = category.split(',').filter(id => mongoose.isValidObjectId(id))
      if (categoryIds.length > 0) {
        mongoQuery.category = { $in: categoryIds }
      }
    }
    if (min) {
      mongoQuery.price = { ...mongoQuery.price, $gte: parseFloat(min) }
    }
    if (maxPrice) {
      mongoQuery.price = { ...mongoQuery.price, $lte: parseFloat(maxPrice) }
    }
    if (collection) {
      mongoQuery.collection = collection
    }
    if (status) {
      mongoQuery.status = status
    }
    if (availability) {
      mongoQuery.availability = availability === 'true'
    }
    if (sizes) {
      mongoQuery.sizes = { $in: sizes.split(',') }
    }
    if (colors) {
      mongoQuery.colors = { $in: colors.split(',') }
    }

    // Fetch products
    const products = await Product.find(mongoQuery)
      .populate('category')
      .sort(
        sort ? { price: sort === 'price-asc' ? 1 : sort === 'price-desc' ? -1 : 1 } : { name: 1 }
      )
      .skip(skip)
      .limit(limitNumber)

    // Count total products for pagination
    const totalProducts = await Product.countDocuments(mongoQuery)
    const totalPage = Math.ceil(totalProducts / limitNumber)

    const pagination = {
      currentPage: +page || 1,
      nextPage: totalProducts > skip + limitNumber ? +page + 1 : null,
      previousPage: skip > 0 ? +page - 1 : null,
      hasNextPage: totalProducts > skip + limitNumber,
      hasPreviousPage: skip > 0,
      lastPage: totalPage,
    }

    res.status(200).json({
      data: {
        products,
        pagination,
        productsLength: totalProducts,
      },
    })
  } catch (err) {
    console.error('Error fetching products:', err)
    res.status(500).json({ message: err.message })
  }
}

const getProductById = async (req, res) => {
  const { id } = req.params
  try {
    const product = await Product.findById(id).populate('category')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const similarProducts = await Product.find({
      _id: { $ne: id }, // Exclude current product
      category: product.category._id, // Same category
    })
      .populate('category')
      .sort({ price: 1 }) // Sort by price
      .limit(6)

    res.status(200).json({
      data: {
        product,
        similarProducts,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    stockQuantity,
    images,
    discount,
    rating,
    colors,
    category,
    tags,
    collection,
    availability,
    sizes,
    sku,
    material,
    ages,
    gender,
    status,
    weight,
  } = req.body

  try {
    const product = await Product.findOne({ name })
    if (product) return res.status(400).json({ message: 'Product already exists' })

    await Product.create({
      name,
      description,
      price,
      salePrice,
      images,
      discount,
      rating,
      stockQuantity,
      category,
      tags,
      collection,
      availability,
      sizes,
      colors,
      sku,
      slug: name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
      material,
      ages,
      gender,
      status,
      weight,
    })
    res.status(201).json({ message: 'Product created' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateProduct = async (req, res) => {
  const { id } = req.params
  const {
    name,
    description,
    price,
    salePrice,
    stockQuantity,
    ages,
    gender,
    material,
    availability,
    tags,
    category,
    collection,
    colors,
    sizes,
    sku,
    status,
  } = req.body

  const updatedAt = new Date().toISOString()
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        salePrice,
        stockQuantity,
        ages,
        gender,
        material,
        slug: name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
        availability,
        tags,
        category,
        collection,
        colors,
        sizes,
        sku,
        status,
        updatedAt,
      },
      { new: true }
    ).populate('category')

    res.status(200).json({ message: 'Product updated', product: updatedProduct })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  try {
    const deletedProduct = await Product.findByIdAndDelete(id).populate('category')
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json({ message: 'Product deleted', product: deletedProduct })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteManyProducts = async (req, res) => {
  const productIds = req.body
  try {
    const deletedProducts = await Product.deleteMany({ _id: { $in: productIds } })
    res.status(200).json({ message: 'Products deleted', deletedProducts, productIds })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteManyProducts,
}
