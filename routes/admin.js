var express = require("express");
var router = express.Router();

const adminController = require("../controllers/Admin.Controller");
const productController = require("../controllers/Product.Controller");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Admin Router is working.");
});

// Admin Signup
router.post("/signup", adminController.AdminSignUp);

// Admin Login
router.post("/login", adminController.AdminLogin);

// Admin isLoggedIn
router.post("/isloggedin", adminController.isLoggedIn);

// Admin Fetch Products
router.post("/fetch-products", productController.fetchProducts);

// Admin Create product
router.post("/create-product", productController.createProduct);

// Admin Update product
router.post("/update-product", productController.updateProduct);

// Admin Delete product
router.post("/delete-product", productController.deleteProduct);

// Admin Fetch single product
router.post("/fetch-single-product", productController.singleProduct);

// Admin Fetch single product
router.post("/fetch-report", adminController.adminReport);

module.exports = router;
