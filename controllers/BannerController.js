const Banner = require('../models/Banner')

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
    res.status(200).json(banners)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) return res.status(404).json({ message: 'Banner not found' })
    res.status(200).json(banner)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const addBanner = async (req, res) => {
  const { title, description, image } = req.body
  if (!title || !description || !image)
    return res.status(400).json({ message: 'Please fill in all fields' })
  try {
    const newBanner = await Banner.create({
      title,
      description,
      image,
    })
    res.status(201).json({ message: 'Banner added', banner: newBanner })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateBanner = async (req, res) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedBanner) return res.status(404).json({ message: 'Banner not found' })
    res.status(200).json({ message: 'Banner updated', banner: updatedBanner })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id)
    if (!banner) return res.status(404).json({ message: 'Banner not found' })
    res.status(200).json({ message: 'Banner deleted', banner })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getAllBanners,
  getBannerById,
  addBanner,
  updateBanner,
  deleteBanner,
}
