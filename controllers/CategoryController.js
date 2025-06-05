const Category = require('../models/Category')

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()

    return res.status(200).json({
      data: {
        categories,
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id
    const category = await Category.findById(id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    return res.status(200).json({
      data: {
        category,
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getCategoryByName = async (req, res) => {
  try {
    const name = req.params.name
    const category = await Category.findOne({ name })
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    return res.status(200).json({ category })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const addCategory = async (req, res) => {
  try {
    const { name, image } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }
    const categoryExist = await Category.findOne({ name })
    if (categoryExist) {
      return res.status(400).json({ message: 'Category already exists' })
    }
    const category = await Category.create({ name, image })
    return res.status(201).json({ message: 'Category added', category })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const updateCategory = async (req, res) => {
  try {
    const name = req.params.name
    const newName = req.body.name
    const image = req.body.image
    const category = await Category.findOne({ name })
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    category.name = newName
    category.image = image || category.image
    const updatedCategory = await category.save()
    return res.status(200).json({ message: 'Category updated', category: updatedCategory })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const name = req.params.name
    const category = await Category.findOne({ name })
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    await Category.deleteOne({ name })
    return res.status(200).json({ message: 'Category deleted', category })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  addCategory,
  updateCategory,
  deleteCategory,
}
