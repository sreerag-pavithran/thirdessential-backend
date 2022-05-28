// Models
const Admin = require("../models/admin.model");

// NPM Packages
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = {
  AdminSignUp,
  AdminLogin,
  isLoggedIn,
};
