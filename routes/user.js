const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const UserController = require('../controller/user');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');

// signup
router.post('/signup', UserController.signup);

// login
router.post('/login', UserController.login);

// logout
router.post('/logout', auth, UserController.logout);

// logout all
router.post('/logoutAll', auth, UserController.logoutAll);

// edit user information
router.post('/me', auth, UserController.editInfo);

// change user password
router.post('/me/changePassword', auth, UserController.changePassword);

// show all users (will check later that the user has admin permissions)
router.get('/', auth, isAdmin, UserController.showAllUsers);

// change user account type
router.post(
	'/changeAccountType',
	auth,
	isAdmin,
	validateObjectId,
	UserController.changeAccountType
);

// add new phone number
router.post('/me/phoneNumbers', auth, UserController.addPhoneNumber);

// delete a phone number
router.delete('/me/phoneNumbers', auth, UserController.delPhoneNumber);

module.exports = router;
