const Discount = require('../models/Discount')

const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
    return res.status(200).json({ discounts })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getDiscountByCode = async (req, res) => {
  try {
    const code = req.params.code
    const discount = await Discount.findOne({ code })
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }
    return res.status(200).json({ discount })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const addDiscount = async (req, res) => {
  try {
    const { name, code, discount, startDate, endDate } = req.body
    if (!name || !code || !discount || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const discountExist = await Discount.findOne({ code })
    if (discountExist) {
      return res.status(400).json({ message: 'Discount already exists ' })
    }
    const newDiscount = await Discount.create({
      name,
      code,
      discount,
      startDate,
      endDate,
    })
    return res.status(201).json({ message: 'Discount added', discount: newDiscount })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const updateDiscount = async (req, res) => {
  try {
    const code = req.params.code
    const newCode = req.body.code
    const newName = req.body.name
    const newDiscount = req.body.discount
    const newStartDate = req.body.startDate
    const newEndDate = req.body.endDate
    const discount = await Discount.findOneAndUpdate(
      { code },
      {
        code: newCode,
        name: newName,
        discount: newDiscount,
        startDate: newStartDate,
        endDate: newEndDate,
      },
      { new: true }
    )
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }
    return res.status(200).json({ message: 'Discount updated', discount })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const deleteDiscount = async (req, res) => {
  try {
    const code = req.params.code
    const discount = await Discount.findOneAndDelete({ code })
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }
    return res.status(200).json({ message: 'Discount deleted', discount })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getAllDiscounts,
  getDiscountByCode,
  addDiscount,
  updateDiscount,
  deleteDiscount,
}
