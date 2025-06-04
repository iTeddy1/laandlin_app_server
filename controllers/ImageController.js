const path = require('path')
const { v4: uuidv4 } = require('uuid')

const Image = require('../models/Image') // Assuming you have an Image model
const ImageCache = require('../models/ImageCache')

require('dotenv').config()

const DEFAULT_LIMIT = 30

const getPagination = (page, limit) => {
  const pageNumber = +page || 1
  const limitNumber = +limit || DEFAULT_LIMIT
  const skip = (pageNumber - 1) * limitNumber
  return { skip, limitNumber, page: pageNumber }
}

const getAllImagesUrl = async (req, res) => {
  try {
    const { page, limit } = req.query
    const { skip, limitNumber } = getPagination(page, limit)
    const images = await ImageCache.find()
      .limit(limitNumber)
      .skip((page - 1) * skip)

    const urls = images.map(image => ({
      url: image.public_id,
      id: image._id,
      imageId: image.imageId,
    }))
    const totalImages = Math.ceil((await ImageCache.countDocuments()) / limitNumber)
    res.status(200).json({ urls, totalPage: totalImages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteManyImages = async (req, res) => {
  try {
    const imageIds = req.body
    const images = await Image.deleteMany({ _id: { $in: imageIds } })

    if (!images) {
      return res.status(404).json({ message: 'No images found' })
    }
    // images = images.map((image) => ({ url: image.public_id, id: image._id }));
    res.status(200).json({ message: 'All images deleted', images })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get image by ID
const getImageById = async (req, res) => {
  try {
    const image = await Image.findOne({ public_id: req.params.id })
    if (!image) {
      return res.status(404).json({ err: 'No image found' })
    }
    res.set('Content-Type', 'image/jpeg')
    res.send(image.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Upload image and return URL
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }
  const newUrl = `file-${Date.now()}-${uuidv4()}${path.extname(req.file.originalname)}`
  const image = await Image.create({
    public_id: newUrl,
    data: req.file.buffer,
  })
  res.status(201).json({ url: image.public_id, id: image._id, message: 'Image uploaded' })
}

const uploadManyImages = async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' })
  }
  try {
    const images = [],
      buffer = []
    for (let i = 0; i < req.files.length; ++i) {
      const newUrl = `file-${Date.now()}-${uuidv4()}${path.extname(req.files[i].originalname)}`
      buffer.push({ public_id: newUrl, data: req.files[i].buffer })
      images.push(newUrl)
    }
    // console.log(buffer);
    await Image.insertMany(buffer)
    res.status(201).json({ message: 'Images uploaded', images })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id)
    if (!image) {
      return res.status(404).json({ message: 'Image not found' })
    }
    res.status(200).json({ message: 'Image deleted', url: image.public_id, id: image._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  deleteManyImages,
  getAllImagesUrl,
  getImageById,
  uploadImage,
  deleteImage,
  uploadManyImages,
}
