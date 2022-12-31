const express = require('express');
const Auth = require('../middleware/auth');
const UserController = require('../controller/userController');
const router = new express.Router();

// signup
router.post('/users', UserController.signup);

// login
router.post('/users/login', UserController.login);

// logout
router.post('/users/logout', Auth, UserController.logout);

// logout all
router.post('/users/logoutAll', Auth, UserController.logoutAll);

module.exports = router;