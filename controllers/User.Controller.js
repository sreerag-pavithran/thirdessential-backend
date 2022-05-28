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

let UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Finding if User Exists
    let findUser = await User.findOne({ email });
    if (!findUser) {
      return res.json({
        status: false,
        message: "User doesn't exists!",
      });
    }

    // Comparing password
    const validPass = await bcrypt.compare(password, findUser.password);
    if (!validPass) {
      return res.json({
        status: false,
        message: "Login credentials doesn't match!",
      });
    }

    // Deselecting Password and updating lastlogin
    const userDetails = await User.findOneAndUpdate(
      { email: email },
      { lastLogin: Date.now() }
    ).select("-password");

    // Assigning token to User in cookies
    let secret = process.env.JWTKEY;
    const token = jwt.sign({ _id: findUser._id }, secret);
    res.cookie("user-id", findUser._id);
    const date = new Date(Date.now() + 10 * 60 * 6);

    return res
      .status(200)
      .cookie("jwt_token", token, {
        maxAge: date,
        secure: false,
        httpOnly: true,
      })
      .json({
        message: "Successfully logged in",
        status: true,
        data: userDetails,
        access_token: token,
        expire_token: date,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Bad Request!",
    });
  }
};

let isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return;
    // Verify Token
    const decoded = jwt.verify(token, process.env.JWTKEY);
    // Check if user still exists
    if (decoded._id) {
      const currentUser = await User.findById(decoded._id);
      if (!currentUser) {
        return res.json({
          status: false,
          message: `Token expired. Please login again.`,
        });
      }
      const userDetails = await User.findById(decoded._id).select("-password");
      // If there's user exists
      req.user = currentUser;
      return res.json({
        status: true,
        message: "User Found",
        data: userDetails,
      });
    } else {
      const currentUser = await User.find({
        email: decoded._id,
      });
      console.log(currentUser);
      if (!currentUser) {
        return res.json({
          status: false,
          message: `User doesn't exists.`,
        });
      }
      return res.json({
        status: true,
        message: "User Found",
        data: currentUser[0],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Bad Request",
    });
  }
};

module.exports = {
  CreateUser,
  fetchUsers,
  UserLogin,
  isLoggedIn,
};
