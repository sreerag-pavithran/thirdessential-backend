// Models
const Admin = require("../models/admin.model");

// NPM Packages
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const dayjs = require("dayjs");

// Bcrypt Salt Count
const salt = 10;

let AdminSignUp = async (req, res, next) => {
  try {
    const { email, phone, name, password, address } = req.body;

    // Finding if email already exists
    let findEmail = await Admin.findOne({ email });
    if (findEmail) {
      return res.json({
        status: false,
        message: "Email already exists!",
      });
    }

    bcrypt.hash(password, salt, async (err, hash) => {
      if (!err) {
        const newAdmin = new Admin({
          name,
          email,
          password: hash,
          phone,
          address,
        });
        try {
          // Saving to Database
          await newAdmin.save();

          // Deselecting Password and updating lastlogin
          const adminDetails = await Admin.findOneAndUpdate(
            { email: email },
            { lastLogin: Date.now() }
          ).select("-password");

          // Finding if Admin Exists
          let findAdmin = await Admin.findOne({ email });

          // Assigning token to User in cookies
          let secret = process.env.JWTKEY;
          const token = jwt.sign({ _id: findAdmin._id }, secret);
          res.cookie("user-id", findAdmin._id);
          const date = new Date(Date.now() + 10 * 60 * 6);

          return res
            .status(200)
            .cookie("jwt_token", token, {
              maxAge: date,
              secure: false,
              httpOnly: true,
            })
            .json({
              message: "Account created!",
              status: true,
              data: adminDetails,
              access_token: token,
              expire_token: date,
            });
        } catch (error) {
          console.log(error);
          return res.json({
            status: false,
            message: "Failed to create account",
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

let AdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Finding if Admin Exists
    let findAdmin = await Admin.findOne({ email });
    if (!findAdmin) {
      return res.json({
        status: false,
        message: "Admin doesn't exists!",
      });
    }

    // Comparing password
    const validPass = await bcrypt.compare(password, findAdmin.password);
    if (!validPass) {
      return res.json({
        status: false,
        message: "Login credentials doesn't match!",
      });
    }

    // Deselecting Password and updating lastlogin
    const adminDetails = await Admin.findOneAndUpdate(
      { email: email },
      { lastLogin: Date.now() }
    ).select("-password");

    // Assigning token to User in cookies
    let secret = process.env.JWTKEY;
    const token = jwt.sign({ _id: findAdmin._id }, secret);
    res.cookie("user-id", findAdmin._id);
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
        data: adminDetails,
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
      const currentUser = await Admin.findById(decoded._id);
      if (!currentUser) {
        return res.json({
          status: false,
          message: `Token expired. Please login again.`,
        });
      }
      const userDetails = await Admin.findById(decoded._id).select("-password");
      // If there's user exists
      req.user = currentUser;
      return res.json({
        status: true,
        message: "User Found",
        data: userDetails,
      });
    } else {
      const currentUser = await Admin.find({
        email: decoded._id,
      });
      console.log(currentUser);
      if (!currentUser) {
        return res.json({
          status: false,
          message: `User doesn't exists. Please Signup`,
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

let adminReport = async (req, res, next) => {
  try {
    const { isVendor, _id } = req.body;

    let startDay = dayjs().startOf("day");
    let endDay = dayjs().endOf("day");

    if (isVendor === true) {
      let totalProducts = await Product.find({ vendor: _id }).countDocuments();
      let totalUsers = await User.find({ _id }).countDocuments();

      let newProducts = await Product.find({
        createdAt: { $gte: startDay, $lt: endDay },
        vendor: _id,
      }).countDocuments();
      let newUsers = await User.find({
        _id,
        createdAt: { $gte: startDay, $lt: endDay },
      }).countDocuments();

      try {
        return res.json({
          status: true,
          message: "Reports fetched",
          data: [
            {
              title: "Total products",
              sub: "Total overall products",
              value: totalProducts,
            },
            {
              title: "Total users",
              sub: "Total overall users",
              value: totalUsers,
            },
            { title: "New users", sub: "New users today", value: newUsers },
            {
              title: "New Products",
              sub: "New products today",
              value: newProducts,
            },
          ],
        });
      } catch (error) {
        return res.json({
          status: false,
          message: "Failed to fetch report",
        });
      }
    } else {
      let totalProducts = await Product.find().countDocuments();
      let totalUsers = await User.find().countDocuments();

      let newProducts = await Product.find({
        createdAt: { $gte: startDay, $lt: endDay },
      }).countDocuments();
      let newUsers = await User.find({
        createdAt: { $gte: startDay, $lt: endDay },
      }).countDocuments();

      try {
        return res.json({
          status: true,
          message: "Reports fetched",
          data: [
            {
              title: "Total products",
              sub: "Total overall products",
              value: totalProducts,
            },
            {
              title: "Total users",
              sub: "Total overall users",
              value: totalUsers,
            },
            { title: "New users", sub: "New users today", value: newUsers },
            {
              title: "New Products",
              sub: "New products today",
              value: newProducts,
            },
          ],
        });
      } catch (error) {
        return res.json({
          status: false,
          message: "Failed to fetch report",
        });
      }
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
  AdminSignUp,
  AdminLogin,
  isLoggedIn,
  adminReport,
};
