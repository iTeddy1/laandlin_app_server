const argon2 = require('argon2')

const { createToken } = require('../middlewares/VerifyJWT')
const Customer = require('../models/Customer')
const User = require('../models/User')
// const sendEmail = require('../utils/sendEmail')

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

const resetPassword = async (req, res) => {
  try {
    const { oldPassword, password, repeatPassword } = req.body
    if (password !== repeatPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }
    const hashedPassword = await argon2.hash(password, 10)
    const user = User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (!oldPassword) {
      return res.status(400).json({ message: 'Old password is required' })
    }
    const match = await argon2.verify(user.password, oldPassword)
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' })
    }
    if (user.password === hashedPassword) {
      return res.status(400).json({ message: 'New password is the same as the old password' })
    }
    await User.findByIdAndUpdate(req.userId, { password: hashedPassword })
    res.status(200).json({ message: 'Password reset' })
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
    console.log(req.body)
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

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(req.userId, { name, phone }, { new: true })
    res.status(200).json({
      message: 'Profile updated',
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

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.userId)
    const match = await argon2.verify(user.password, currentPassword)
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' })
    }
    const hashedPassword = await argon2.hash(newPassword, 10)
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { password: hashedPassword },
      { new: true }
    )
    res.status(200).json({
      message: 'Password updated',
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

const updateAddress = async (req, res) => {
  try {
    const { addressId, fullName, phoneNumber, country, state, city, county, address, isDefault } =
      req.body
    const newAddress = {
      _id: addressId,
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
    const index = addresses.findIndex(address => address._id == addressId)
    if (index === -1) return res.status(404).json({ message: 'Address not found' })
    addresses[index] = newAddress
    if (isDefault) {
      addresses.forEach(address => {
        address.isDefault = address._id == addressId
      })
      ;[addresses[0], addresses[index]] = [addresses[index], addresses[0]]
    } else {
      addresses[index].isDefault = false
      const hasDefault = addresses.some(address => address.isDefault)
      if (!hasDefault) {
        addresses[0].isDefault = true
      }
    }
    await User.findByIdAndUpdate(req.userId, { addresses })
    res.status(200).json({ message: 'Address updated', address: newAddress })
  } catch (err) {
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

const googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        role: 'user',
        addresses: [],
        phone: '',
        password: '',
      })
    }
    const accessToken = createToken({ userId: user._id, role: user.role })
    res.cookie('access-token', accessToken, {
      maxAge: 2592000000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    res.status(200).json({ message: 'Login success' })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.body
    if (!addressId) return res.status(400).json({ message: 'Address id is required' })
    const user = await User.findById(req.userId)
    const index = user.addresses.findIndex(address => address._id == addressId)
    if (index == -1) return res.status(404).json({ message: 'Address not found' })
    if (user.addresses[index].isDefault && user.addresses.length > 1) {
      user.addresses[!index ? 1 : 0].isDefault = true
    }
    user.addresses.splice(index, 1)
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { addresses: user.addresses },
      { new: true }
    )
    res.status(200).json({
      message: 'Address deleted',
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

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true })
    res.status(200).json({
      message: 'User deleted',
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

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
    res.status(200).json({ customers })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getAllRoles = async (req, res) => {
  try {
    const roles = await User.distinct('role')
    res.status(200).json({ roles })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  userLogin,
  userRegister,
  userLogout,
  // forgotPassword,
  resetPassword,
  getUser,
  updateProfile,
  updatePassword,
  updateAddress,
  googleLogin,
  updateUser,
  deleteAddress,
  addAddress,
  updateRole,
  deleteUser,
  getAllUsers,
  getUserById,
  getAllCustomers,
  getAllRoles,
}
