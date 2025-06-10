const argon2 = require('argon2')

const { createToken } = require('../middlewares/VerifyJWT')
const User = require('../models/User')

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user === null) {
      return res.status(404).json({ message: 'Email is not valid' })
    }
    const match = await argon2.verify(user.password, password)
    if (match) {
      const accessToken = createToken({ userId: user._id, role: user.role })
      res.cookie('access-token', accessToken, {
        maxAge: 2592000000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      res.status(200).json({
        message: 'Login success',
        user: {
          name: user.name,
          email: user.email,
          address: user.address,
          phone: user.phone,
          role: user.role,
        },
        token: accessToken,
      })
    } else {
      res.status(401).json({ message: 'Incorrect email or password' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const user = await User.findOne({ email })
    if (user !== null) {
      console.log(user)
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await argon2.hash(password, 10)
    const newUser = await User.create({
      name,
      email,
      addresses: [],
      phone: '',
      password: hashedPassword,
    })
    await Customer.create({
      user: newUser._id,
      name,
    })
    res.status(201).json({ message: 'User created' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const userLogout = async (req, res) => {
  try {
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    res.status(200).json({ message: 'Logout success' })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}


const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.status(200).json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        address: user?.address,
        mobile: user.mobile,
        role: user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const updateUser = async (req, res) => {
  try {
    const { name, email, mobile, address } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, mobile, address },
      { new: true }
    )
    res.status(200).json({
      message: 'User updated',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        mobile: user.mobile,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const addAddress = async (req, res) => {
  try {
    const { fullName, phoneNumber, country, state, city, county, address, isDefault } = req.body
    const newAddress = {
      fullName,
      phoneNumber,
      country,
      state,
      city,
      county,
      address,
      isDefault,
    }
    const user = await User.findById(req.userId)
    const addresses = user.addresses
    if (isDefault) {
      addresses.forEach(address => {
        address.isDefault = false
      })
      addresses.unshift(newAddress)
    } else {
      addresses.push(newAddress)
    }
    const updatedUser = await User.findByIdAndUpdate(req.userId, {
      addresses: [...user.addresses],
    })
    res.status(200).json({
      message: 'Address added',
      address: newAddress,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        addresses: updatedUser.addresses,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const updateRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true })
    res.status(200).json({
      message: 'Role updated',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        addresses: user.addresses,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json({ users })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    res.status(200).json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}


module.exports = {
  userLogin,
  userRegister,
  userLogout,
  getUser,
  updateUser,
  addAddress,
  updateRole,
  getAllUsers,
  getUserById,

}
