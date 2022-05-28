var express = require("express");
var router = express.Router();

const adminController = require("../controllers/Admin.Controller");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Admin Router is working.");
});

// Admin Signup
router.post("/signup", adminController.AdminSignUp);

// Admin Login
router.post("/login", adminController.AdminLogin);

module.exports = router;
