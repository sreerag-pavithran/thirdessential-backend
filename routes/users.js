var express = require("express");
var router = express.Router();

const userController = require("../controllers/User.Controller");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// Create new User
router.post("/create-user", userController.CreateUser);

// Fetch Users
router.post("/fetch-users", userController.fetchUsers);

// User Login
router.post("/login", userController.UserLogin);

// User IsLoggedIn
router.post("/isloggedin", userController.isLoggedIn);

module.exports = router;
