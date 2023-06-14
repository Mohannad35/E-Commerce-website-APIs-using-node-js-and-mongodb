import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import UserValidator from '../validation/user.js';
import UserController from '../controller/user.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// get user
router.get('/me', [auth], UserController.user);

// refresh auth token
router.get('/refresh-token', [auth], UserController.refreshToken);

// show all users (will check later that the user has admin permissions)
router.get('/', [auth, isAdmin, validate('query', UserValidator.getUsers)], UserController.users);

router.get(
	'/stats',
	[auth, isAdmin, validate('query', UserValidator.getStats)],
	UserController.stats
);

router.delete('/', [auth, isAdmin, validate('body', UserValidator.id)], UserController.deleteUser);

router.post('/ban', [auth, isAdmin, validate('body', UserValidator.id)], UserController.banUser);

// signup
router.post('/signup', [validate('body', UserValidator.signup)], UserController.signup);

// verify
router.get('/verify', [validate('query', UserValidator.token)], UserController.verify);

// resend verification email
router.get('/resend-verify', [auth], UserController.resend);

// forget password
router.post(
	'/forget-password',
	[validate('body', UserValidator.email)],
	UserController.forgetPassword
);

// redirect forget password
router.get(
	'/forget-password',
	[validate('query', UserValidator.token)],
	UserController.redirectForgetPassword
);

// reset password using code sent to email
router.post(
	'/reset-password',
	[validate('body', UserValidator.resetPassword)],
	UserController.changeForgetPassword
);

// login
router.post('/login', [validate('body', UserValidator.login)], UserController.login);

// edit user information
router.patch('/me', [auth, validate('body', UserValidator.userInfo)], UserController.editInfo);

// vendor request
router.post(
	'/vendor-req',
	[auth, validate('body', UserValidator.vendorReq)],
	UserController.vendorRequest
);

// get vendor requests
router.get('/vendor-req', [auth, isAdmin], UserController.getVendorRequests);

// cancel vendor request
router.delete(
	'/vendor-req/:id',
	[auth, isAdmin, validateObjectId],
	UserController.cancelVendorRequest
);

// change user password
router.post(
	'/me/changePassword',
	[auth, validate('body', UserValidator.password)],
	UserController.changePassword
);

// change user account type
router.post(
	'/changeAccountType/:id',
	[auth, isAdmin, validateObjectId, validate('body', UserValidator.accountType)],
	UserController.changeAccountType
);

export default router;
