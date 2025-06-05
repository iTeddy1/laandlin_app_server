const moment = require('moment-timezone')
const schedule = require('node-schedule')

const Order = require('../models/Order')
const Product = require('../models/Product')

const createOrder = async (req, res) => {
  const { items, address, description, totalItems, mobile, totalDiscount, paymentMethod } = req.body
  if (!address) {
    return res.status(400).json({ error: 'Address is required' })
  }
  const orderItems = await Promise.all(
    items.map(async item => {
      if (!item.productId) {
        return res.status(400).json({ error: 'Product id is required' })
      }
      if (!item.color) {
        return res.status(400).json({ error: 'Color is required' })
      }
      if (!item.quantity) {
        return res.status(400).json({ error: 'Quantity is required' })
      }
      const product = await Product.findById(item.productId).populate('category')

      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.product} not found` })
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.sizes.find(size => size.size === item.size)?.price || product.price,
        salePrice:
          product.sizes.find(size => size.size === item.size)?.salePrice || product.salePrice,
        product: item.product,
        color: item.color,
        size: item.size,
        category: product.category.name,
        name: product.name,
        slug: product.slug,
      }
    })
  )
  const orderDate = moment().tz('Asia/Bangkok').toDate()
  const dueOrderDate = moment(orderDate).add(1, 'day').toDate()

  try {
    const order = new Order({
      user: req.userId,
      items: orderItems,
      address,
      orderDate,
      description,
      mobile,
      paymentMethod: paymentMethod || 'Pay online',
    })
    await order.save()

    console.log(order)
    schedule.scheduleJob(dueOrderDate, async () => {
      const canceledOrder = await Order.findById(order._id)
      if (canceledOrder.status === 'pending') {
        canceledOrder.status = 'canceled'
        await canceledOrder.save()
      }
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getAllOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId })
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.category')
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateOrderStatusById = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order status cannot be updated' })
    }
    order.status = status
    await order.save()
    res.status(200).json({ message: 'Order status updated', order })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updatePaymentStatusById = async (req, res) => {
  try {
    const { paymentStatus } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    order.paymentStatus = paymentStatus
    await order.save()
    res.status(200).json({ message: 'Payment status updated', order })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getAllOrdersByUserId,
  getOrderById,
  getUserOrderById,
  updateOrderStatusById,
  updatePaymentStatusById,
}
