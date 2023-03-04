const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const UserController = require('../controller/user');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validateReq');
const Validator = require('../middleware/Validator');

// refresh auth token
router.get('/refresh-jwt', [auth], UserController.refreshToken);

// show all users (will check later that the user has admin permissions)
router.get('/', [auth, isAdmin, validate('query', Validator.getUsers)], UserController.users);

// signup
router.post('/signup', [validate('body', Validator.signup)], UserController.signup);

// login
router.post('/login', [validate('body', Validator.login)], UserController.login);

// logout
router.post('/logout', [auth], UserController.logout);

// logout all
router.post('/logoutSessions', [auth], UserController.logoutSessions);

// edit user information
router.post('/me', [auth, validate('body', Validator.userInfo)], UserController.editInfo);

// change user password
router.post(
	'/me/changePassword',
	[auth, validate('body', Validator.password)],
	UserController.changePassword
);

// change user account type
router.post(
	'/changeAccountType/:id',
	[auth, isAdmin, validateObjectId, validate('body', Validator.accountType)],
	UserController.changeAccountType
);

// add new phone number
router.post(
	'/me/phoneNumbers',
	[auth, validate('body', Validator.phoneNumber)],
	UserController.addPhoneNumber
);

// delete a phone number
router.delete(
	'/me/phoneNumbers',
	[auth, validate('body', Validator.phoneNumber)],
	UserController.delPhoneNumber
);

module.exports = router;
