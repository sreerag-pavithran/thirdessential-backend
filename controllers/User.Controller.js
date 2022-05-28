// Models
const User = require("../models/user.model");

// NPM Packages
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Bcrypt Salt Count
const salt = 10;

let CreateUser = async (req, res, next) => {
  try {
    const { email, phone, name, password, address } = req.body;

    // Finding if email already exists
    let findEmail = await User.findOne({ email });
    if (findEmail) {
      return res.json({
        status: false,
        message: "Email already exists!",
      });
    }

    bcrypt.hash(password, salt, async (err, hash) => {
      if (!err) {
        const newUser = new User({
          name,
          email,
          password: hash,
          phone,
          address,
        });
        try {
          // Saving to Database
          await newUser.save();

          // Deselecting Password and updating lastlogin
          const userDetails = await User.findOneAndUpdate(
            { email: email },
            { lastLogin: Date.now() }
          ).select("-password");

          const fetchUsers = await User.find().select("-password");
          try {
            return res.json({
              status: true,
              data: fetchUsers,
              message: "New user added!",
            });
          } catch (error) {
            return res.json({
              status: false,
              message: "Failed to add new user!",
            });
          }
        } catch (error) {
          console.log(error);
          return res.json({
            status: false,
            message: "Failed to add new user!",
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Bad Request!",
    });
  }
};

let fetchUsers = async (req, res, next) => {
  try {
    let fetchUsers = await User.find().select("-password");
    try {
      return res.json({
        status: true,
        data: fetchUsers,
        message: "User data fetched",
      });
    } catch (error) {
      return res.json({
        status: false,
        message: "Failed to fetch user data!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Bad Request!",
    });
  }
};

module.exports = {
  CreateUser,
  fetchUsers,
};
