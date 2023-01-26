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

// edit user information
router.post("/user", Auth, UserController.editInfo);

// change user password
router.post("/user/changePassword", Auth, UserController.changePassword);

// change user account type
router.post("/user/changeAccountType", Auth, UserController.changeAccountType);

// add new phone number
router.post("/user/phoneNumbers", Auth, UserController.addPhoneNumber);

// delete a phone number
router.post("/user/phoneNumbers/delete", Auth, UserController.delPhoneNumber);

module.exports = router;
