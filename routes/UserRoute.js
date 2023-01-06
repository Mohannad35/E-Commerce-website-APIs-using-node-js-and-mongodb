const express = require("express");
const Auth = require("../middleware/auth");
const UserController = require("../controller/UserController");

const router = new express.Router();

// signup
router.post("/users", UserController.signup);

// login
router.post("/users/login", UserController.login);

// logout
router.post("/users/logout", Auth, UserController.logout);

// logout all
router.post("/users/logoutAll", Auth, UserController.logoutAll);

// show all users (will check later that the user has admin permissions)
router.get("/users/showAll", Auth, UserController.showAllUsers);

module.exports = router;
