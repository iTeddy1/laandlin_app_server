const Tag = require('../models/Tag')

const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find()
    return res.status(200).json({ tags })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getTagById = async (req, res) => {
  try {
    const id = req.params.id
    const tag = await Tag.findById(id)
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' })
    }
    return res.status(200).json({ tag })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getTagByName = async (req, res) => {
  try {
    const name = req.params.name
    const tag = await Tag.findOne({ name })
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' })
    }
    return res.status(200).json({ tag })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const addTag = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }
    const tagExist = await Tag.findOne({ name })
    if (tagExist) {
      return res.status(400).json({ message: 'Tag already exists' })
    }
    const tag = await Tag.create({ name })
    return res.status(201).json({ message: 'Tag added', tag })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const updateTag = async (req, res) => {
  try {
    const name = req.params.name
    const newName = req.body.name
    if (!newName) {
      return res.status(400).json({ message: 'New name is required' })
    }
    const tag = await Tag.findOneAndUpdate({ name }, { name: newName }, { new: true })
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' })
    }
    return res.status(200).json({ message: 'Tag updated', tag })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const deleteTag = async (req, res) => {
  try {
    const name = req.params.name
    const tag = await Tag.findOneAndDelete({ name })
    return res.status(200).json({ message: 'Tag deleted', tag })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getAllTags,
  getTagById,
  getTagByName,
  addTag,
  updateTag,
  deleteTag,
}
