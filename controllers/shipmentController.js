const axios = require('axios')

const Order = require('../models/Order')
const Shipping = require('../models/Shipment')
require('dotenv').config()

// Create a new shipping record
const createShipping = async (req, res) => {
  try {
    const { orderId, shippingMethod, weight, dimensions, notes } = req.body

    // Verify order exists
    const order = await Order.findById(orderId).populate('items').populate('user')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if shipping already exists
    const existingShipping = await Shipping.findOne({ order: orderId })
    if (existingShipping) {
      return res.status(400).json({ message: 'Shipping already exists for this order' })
    }

    // Format products array for GHTK
    const products = order.items.map(item => ({
      name: item.name,
      price: item.price,
      weight: item.weight || 0.1, // Default 100g if not specified
      quantity: item.quantity,
      product_code: item.productId.toString(),
    }))

    // Validate required address fields
    if (!order.address.address || !order.address.county) {
      throw new Error('Missing required address information (street or ward)')
    }

    // Create shipping order with GHTK
    const ghtkPayload = {
      products,
      order: {
        id: orderId,
        // Pickup information from environment variables
        pick_name: process.env.GHTK_PICKUP_NAME,
        pick_address: process.env.GHTK_PICKUP_ADDRESS,
        pick_province: process.env.GHTK_PICKUP_PROVINCE,
        pick_district: process.env.GHTK_PICKUP_DISTRICT,
        pick_ward: process.env.GHTK_PICKUP_WARD,
        pick_street: process.env.GHTK_PICKUP_STREET,
        pick_tel: process.env.GHTK_PICKUP_TEL,
        pick_email: process.env.GHTK_PICKUP_EMAIL,
        pick_money: 0, // No COD

        // Delivery information from order
        name: order.address.fullName,
        address: order.address.address,
        province: order.address.city,
        district: order.address.county,
        ward: order.address.state,
        street: order.address.address,
        hamlet: 'Khác',
        tel: order.address.phoneNumber,
        note: notes || '',
        email: order.user.email,

        // Additional settings
        is_freeship: 1,
        weight_option: 'kilogram',
        total_weight: weight / 1000, // Convert from grams to kg
        value: order.totalAmount,
        transport: shippingMethod === 'express' ? 'fly' : 'road',
        pick_work_shift: 1,
        deliver_work_shift: 0,
        actual_transfer_method: shippingMethod === 'express' ? 'fly' : 'road',
      },
    }

    console.log(ghtkPayload)

    const ghtkResponse = await axios.post(
      `${process.env.GHTK_API_URL}/services/shipment/order`,
      ghtkPayload,
      {
        headers: {
          Token: process.env.GHTK_TOKEN,
        },
      }
    )

    if (!ghtkResponse.data.success) {
      throw new Error(ghtkResponse.data.message || 'Failed to create shipping with GHTK')
    }

    // Create local shipping record
    const shipping = await Shipping.create({
      order: orderId,
      carrier: 'GHTK',
      trackingNumber: ghtkResponse.data.order.label,
      shippingMethod,
      shippingCost: ghtkResponse.data.order.fee,
      weight,
      dimensions,
      notes,
      status: 'processing',
    })

    // Update order status
    await Order.findByIdAndUpdate(orderId, { status: 'shipped' })

    res.status(201).json(shipping)
  } catch (error) {
    console.error('GHTK Shipping Error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// Get all shipping records
const getAllShippings = async (req, res) => {
  try {
    const shippings = await Shipping.find().populate('order', 'orderDate status totalAmount')
    res.status(200).json(shippings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get shipping by ID with status update from GHTK
const getShippingById = async (req, res) => {
  try {
    const shipping = await Shipping.findById(req.params.id).populate('order')

    if (!shipping) {
      return res.status(404).json({ message: 'Shipping not found' })
    }

    // Get latest tracking info from GHTK
    const ghtkResponse = await axios.get(
      `${process.env.GHTK_API_URL}/services/shipment/v2/${shipping.trackingNumber}`,
      {
        headers: {
          Token: process.env.GHTK_TOKEN,
        },
      }
    )

    if (ghtkResponse.data.success) {
      const ghtkStatus = ghtkResponse.data.order.status
      // Map GHTK status to our status
      const statusMap = {
        '-1': 'failed',
        1: 'processing',
        2: 'in_transit',
        3: 'delivered',
        4: 'returned',
      }

      shipping.status = statusMap[ghtkStatus] || shipping.status
      await shipping.save()
    }

    res.status(200).json(shipping)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get shipping by order ID
const getShippingByOrderId = async (req, res) => {
  try {
    const shipping = await Shipping.findOne({ order: req.params.orderId }).populate(
      'order',
      'orderDate status totalAmount'
    )
    if (!shipping) {
      return res.status(404).json({ message: 'Shipping not found' })
    }

    // Get latest status from GHTK
    const ghtkResponse = await axios.get(
      `${process.env.GHTK_API_URL}/services/shipment/v2/${shipping.trackingNumber}`,
      {
        headers: {
          Token: process.env.GHTK_TOKEN,
        },
      }
    )

    if (ghtkResponse.data.success) {
      shipping.status = ghtkResponse.data.order.status
      await shipping.save()
    }

    res.status(200).json(shipping)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update shipping status
const updateShippingStatus = async (req, res) => {
  try {
    const { status, actualDeliveryDate } = req.body
    const shipping = await Shipping.findById(req.params.id)

    if (!shipping) {
      return res.status(404).json({ message: 'Shipping not found' })
    }

    shipping.status = status
    if (status === 'delivered') {
      shipping.actualDeliveryDate = actualDeliveryDate || new Date()
      await Order.findByIdAndUpdate(shipping.order, { status: 'delivered' })
    }

    await shipping.save()
    res.status(200).json({ message: 'Shipping status updated', shipping })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update shipping details
const updateShipping = async (req, res) => {
  try {
    const updates = req.body
    const shipping = await Shipping.findById(req.params.id)

    if (!shipping) {
      return res.status(404).json({ message: 'Shipping not found' })
    }

    // Update shipping with GHTK
    const ghtkPayload = {
      order: {
        label: shipping.trackingNumber,
        note: updates.notes,
        weight: updates.weight,
      },
    }

    await axios.post(`${process.env.GHTK_API_URL}/services/shipment/update`, ghtkPayload, {
      headers: {
        Token: process.env.GHTK_TOKEN,
      },
    })

    const updatedShipping = await Shipping.findByIdAndUpdate(req.params.id, updates, { new: true })

    res.status(200).json(updatedShipping)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete shipping
const deleteShipping = async (req, res) => {
  try {
    const shipping = await Shipping.findById(req.params.id)
    if (!shipping) {
      return res.status(404).json({ message: 'Shipping not found' })
    }

    // Cancel shipping with GHTK
    await axios.post(
      `${process.env.GHTK_API_URL}/services/shipment/cancel/${shipping.trackingNumber}`,
      {},
      {
        headers: {
          Token: process.env.GHTK_TOKEN,
        },
      }
    )

    await shipping.remove()
    res.status(200).json({ message: 'Shipping cancelled and deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createShipping,
  getAllShippings,
  getShippingById,
  getShippingByOrderId,
  updateShippingStatus,
  updateShipping,
  deleteShipping,
}
