const Banner = require('../models/Banner')

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
    const bannerOneType = banners.slice(0, 4)
    const bannerTwoType = banners.slice(4, 8)
    res.status(200).json({
      data: { bannerOneType, bannerTwoType },
      message: 'Banners fetched successfully',
    })
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
  const { image } = req.body
  if (!image) return res.status(400).json({ message: 'Please fill in all fields' })
  try {
    const newBanner = await Banner.create({
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
