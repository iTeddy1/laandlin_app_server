const Category = require('../models/Category')
const Product = require('../models/Product')

const DEFAULT_LIMIT = 30

const getPagination = (page, limit) => {
  const pageNumber = +page || 1
  const limitNumber = +limit || DEFAULT_LIMIT
  const skip = (pageNumber - 1) * limitNumber
  return { skip, limitNumber, page: pageNumber }
}

const applySort = (a, b, sort) => {
  switch (sort) {
    case 'price-asc':
      return a.price - b.price
    case 'price-desc':
      return b.price - a.price
    case 'sale-desc':
      return b.price - b.salePrice - (a.price - a.salePrice)
    case 'best-selling':
      return b.sold - a.sold
    case 'newest':
      return new Date(b.createdAt) - new Date(a.createdAt)
    default:
      return 0
  }
}

const applyFilter = async (products, filter) => {
  let { minPrice, maxPrice, category, status, availability, colors, sizes } = filter
  // tags = tags?.split(',')
  colors = colors?.split(',')
  sizes = sizes?.split(',')
  colors = colors?.map(color => `#${color}`)
  availability = availability
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  try {
    const categoryId = await Category.findOne({ name: category })
    // const tagIds = await Tag.find({ name: { $in: tags } }).select('_id')
    return products.filter(product => {
      if (minPrice && product.salePrice < minPrice) {
        return false
      }
      if (maxPrice && product.salePrice > maxPrice) {
        return false
      }
      if (categoryId && product.category !== categoryId) {
        return false
      }
      if (status && product.status !== status) {
        return false
      }
      if (availability && product.availability !== availability) {
        return false
      }
      if (colors) {
        let colorMatch = false
        colors.forEach(color => {
          if (product.colors.some(productColor => productColor.color === color)) {
            colorMatch = true
          }
        })
        if (!colorMatch) return false
      }
      if (sizes) {
        let sizeMatch = false
        sizes.forEach(size => {
          if (product.sizes.some(productSize => productSize.size === size)) {
            sizeMatch = true
          }
        })
        if (!sizeMatch) return false
      }
      return true
    })
  } catch (err) {
    return []
  }
}

const getAllProducts = async (req, res) => {
  const { page, limit, sort, query } = req.query
  const filter = {
    minPrice: req.query.min,
    maxPrice: req.query.max,
    category: req.query.category,
    collection: req.query.collection,
    status: req.query.status,
    availability: req.query.availability,
    sizes: req.query.sizes,
    colors: req.query.colors,
  }
  // console.log(filter)
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const products = await Product.find(
      query ? { name: { $regex: query, $options: 'i' } } : {}
    ).populate('category')

    let filteredProducts = products.sort((a, b) => applySort(a, b, sort))
    filteredProducts = await applyFilter(filteredProducts, filter)
    const totalPage = Math.ceil(filteredProducts.length / limitNumber)
    const totalProducts = await Product.countDocuments(query)
    filteredProducts = filteredProducts.slice(skip, skip + limitNumber)

    const pagination = {
      currentPage: +page || 1,
      nextPage: +page + 1,
      previousPage: +page - 1,
      hasNextPage: filteredProducts.length > skip + limitNumber,
      hasPreviousPage: skip > 0,
      lastPage: totalPage,
    }
    res.status(200).json({
      data: {
        products: filteredProducts,
        pagination,
        productLength: totalProducts,
      },
    })
  } catch (err) {
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

    res.status(200).json({
      data: {
        product,
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
    )
      .populate('category')
      .populate('collection')
      .populate('tags')

    res.status(200).json({ message: 'Product updated', product: updatedProduct })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  try {
    const deletedProduct = await Product.findByIdAndDelete(id)
      .populate('category')
      .populate('collection')
      .populate('tags')
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

const getProductsByCategory = async (req, res) => {
  const { name } = req.params
  const { page, limit, sort } = req.query
  const filter = {
    minPrice: req.query.min,
    maxPrice: req.query.max,
    category: req.query.category,
    tags: req.query.tags,
    collection: req.query.collection,
    status: req.query.status,
    availability: req.query.availability,
    sizes: req.query.sizes,
    colors: req.query.colors,
  }
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const categoryId = await Category.findOne({ name })

    if (!categoryId) {
      return res.status(404).json({ message: 'Category not found' })
    }
    const products = await Product.find({ category: categoryId })
      .limit(limitNumber)
      .skip(skip)
      .populate('category')
      .populate('collection')
      .populate('tags')

    const totalPage = Math.ceil((await Product.countDocuments({ category: categoryId })) / limit)
    let filteredProducts = products.sort((a, b) => applySort(a, b, sort))
    filteredProducts = await applyFilter(filteredProducts, filter)

    res.status(200).json({ products: filteredProducts, totalPage })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAllSizes = async (req, res) => {
  try {
    const sizes = await Product.distinct('sizes.size')
    sizes.sort((a, b) => {
      if (a.length < b.length) return -1
      if (a.length > b.length) return 1
      return a - b
    })
    res.status(200).json({ sizes })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getProductBySKU = async (req, res) => {
  const { sku } = req.params
  try {
    const product = await Product.findOne({ sku }).populate('category')
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json({ product })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getProductsByStatus = async (req, res) => {
  const { status, page, limit, sort } = req.query
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const products = await Product.find({ status })
      .limit(limitNumber)
      .skip(skip)
      .populate('category')

    const totalPage = Math.ceil((await Product.countDocuments({ status })) / limit)

    res.status(200).json({ products: products.sort((a, b) => applySort(a, b, sort)), totalPage })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getProductsByPriceRange = async (req, res) => {
  const { min, max, page, limit, sort } = req.query
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const products = await Product.find({ price: { $gte: min, $lte: max } })
      .limit(limitNumber)
      .skip(skip)

    const totalPage = Math.ceil(
      (await Product.countDocuments({ price: { $gte: min, $lte: max } })) / limit
    )

    res.status(200).json({ products: products.sort((a, b) => applySort(a, b, sort)), totalPage })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getRecentlyAddedProducts = async (req, res) => {
  const { page, limit } = req.query
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .skip(skip)
      .populate('category')
      .populate('collection')
      .populate('tags')
    res.status(200).json({ products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getPopularProducts = async (req, res) => {
  const { page, limit, productId } = req.query
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const products = await Product.find({ _id: { $ne: productId } })
      .sort({ sold: -1 })
      .limit(limitNumber)
      .skip(skip)
      .populate('category')

    const totalPage = Math.ceil((await Product.countDocuments({ _id: { $ne: productId } })) / limit)

    res.status(200).json({ products, totalPage })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getRelatedProducts = async (req, res) => {
  const { productId } = req.params
  const { page, limit } = req.query
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' })
  }
  try {
    const { skip, limitNumber } = getPagination(page, limit)
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const relatedProducts = await Product.find({
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        { collection: product.collection },
      ],
      _id: { $ne: productId },
    })
      .limit(limitNumber)
      .skip(skip)
      .sort({ sold: -1 })
      .populate('category')

    if (relatedProducts.length === 0) {
      return res.status(404).json({ message: 'Related products not found' })
    }

    res.status(200).json({ products: relatedProducts })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message })
  }
}

const getProductBySlug = async (req, res) => {
  const { slug } = req.params
  try {
    const product = await Product.findOne({ slug }).populate('category')
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json({ product })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAllColors = async (req, res) => {
  try {
    const colors = await Product.distinct('colors.color')
    if (!colors) {
      return res.status(404).json({ message: 'Colors not found' })
    }
    res.status(200).json({ colors })
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
  getProductsByCategory,
  getProductBySKU,
  getProductsByStatus,
  getProductsByPriceRange,
  getRecentlyAddedProducts,
  getPopularProducts,
  deleteManyProducts,
  getProductBySlug,
  getAllSizes,
  getAllColors,
  getRelatedProducts,
}
