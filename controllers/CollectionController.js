const Collection = require('../models/Collection')

const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
    return res.status(200).json({ collections })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getCollectionById = async (req, res) => {
  try {
    const id = req.params.id
    const collection = await Collection.findById(id)
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' })
    }
    return res.status(200).json({ collection })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const addCollection = async (req, res) => {
  try {
    const {
      name,
      bannerUrl,
      avatarUrl,
      shortDescription,
      headline,
      description,
      mainImageUrl,
      galleryImageUrls,
    } = req.body
    if (
      !name ||
      !bannerUrl ||
      !avatarUrl ||
      !shortDescription ||
      !headline ||
      !mainImageUrl ||
      !galleryImageUrls
    ) {
      return res.status(400).json({ message: 'Please fill all fields' })
    }
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
    const existingCollection = await Collection.findOne({ name })
    if (existingCollection) {
      return res.status(400).json({ message: 'Collection already exists' })
    }

    const collection = await Collection.create({
      name,
      slug,
      bannerUrl,
      avatarUrl,
      shortDescription,
      headline,
      description,
      mainImageUrl,
      galleryImageUrls,
    })
    return res.status(201).json({ message: 'Collection added', collection })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const updateCollection = async (req, res) => {
  try {
    const {
      name,
      bannerUrl,
      avatarUrl,
      shortDescription,
      headline,
      description,
      mainImageUrl,
      galleryImageUrls,
    } = req.body
    const { id } = req.params
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
    const collection = await Collection.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        bannerUrl,
        avatarUrl,
        shortDescription,
        headline,
        description,
        mainImageUrl,
        galleryImageUrls,
      },
      { new: true }
    )
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' })
    }
    return res.status(200).json({ message: 'Collection updated', collection })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params
    const collection = await Collection.findByIdAndDelete(id)
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or already deleted' })
    }
    return res.status(200).json({ message: 'Collection deleted', collection })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getCollectionBySlug = async (req, res) => {
  try {
    const slug = req.params.slug
    console.log(slug)
    const collection = await Collection.findOne({ slug })
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' })
    }
    return res.status(200).json({ collection })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getAllCollections,
  getCollectionById,
  addCollection,
  updateCollection,
  deleteCollection,
  getCollectionBySlug,
}
