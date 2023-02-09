const express = require('express');
const Auth = require('../middleware/auth');
const UserController = require('../controller/user');

const router = express.Router();

// signup
router.post('/signup', UserController.signup);

// login
router.post('/login', UserController.login);

// logout
router.post('/logout', Auth, UserController.logout);

// logout all
router.post('/logoutAll', Auth, UserController.logoutAll);

// show all users (will check later that the user has admin permissions)
router.get('/showAll', Auth, UserController.showAllUsers);

// edit user information
router.post('/user', Auth, UserController.editInfo);

// change user password
router.post('/user/changePassword', Auth, UserController.changePassword);

// change user account type
router.post('/user/changeAccountType', Auth, UserController.changeAccountType);

// add new phone number
router.post('/user/phoneNumbers', Auth, UserController.addPhoneNumber);

// delete a phone number
router.post('/user/phoneNumbers/delete', Auth, UserController.delPhoneNumber);

module.exports = router;
