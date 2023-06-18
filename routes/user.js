import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import UserValidator from '../validation/user.js';
import UserController from '../controller/user.js';
import validateObjectId from '../middleware/validateObjectId.js';
const rouster = Router();

// get user
router.get('/me', [auth], UserController.user);

// show all users (will check later that the user has admin permissions)
router.get('/', [auth, isAdmin, validate('query', UserValidator.getUsers)], UserController.users);

// refresh auth token
router.get('/refresh-token', [auth], UserController.refreshToken);

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

// api documentation
/**
 * @api {get} /api/user/me Get User Information
 * @apiName GetUserInformation
 * @apiGroup User
 * @apiDescription Used to retrieve user profile information
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Client
 *
 * @apiSuccess (200) {Object} user contains User profile information.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "_id": "647e4fc08ef18203fec14421",
 *         "name": "Ahmed",
 *         "email": "ahmed@gmail.com",
 *         "isVerified": true,
 *         "status": "active",
 *         "password": "$2a$10$PFeCh3PShL4El1QL44XXYec6wTG.Ppa0JMlOL3TbJgpNwoYvVVk9u",
 *         "accountType": "admin",
 *         "phoneNumber": "01162644103",
 *         "address": "address",
 *         "birthday": "1994-06-05T00:00:00.000Z",
 *         "gender": "male",
 *         "createdAt": "2023-06-05T21:12:32.194Z",
 *         "updatedAt": "2023-06-05T21:12:32.194Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user Get all Users
 * @apiName GetAllUsers
 * @apiGroup User
 * @apiDescription Used to retrieve all users in the system any query sent doesn't meet the requirements will return an error 400 bad request or an empty response.
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Admin
 *
 * @apiQuery {String="admin","vendor","client"} accountType User account type.
 * @apiQuery {String} name User name.
 * @apiQuery {String} email User e-mail.
 * @apiQuery {String="male","female"} gender User gender.
 * @apiQuery {Number} age User age. will return users older than age.
 * @apiQuery {Number} maxAge User age. will return users younger than maxAge.
 * @apiQuery {Number} pageNumber number ofd page to be sent.
 * @apiQuery {Number} pageSize size of page to be sent.
 * @apiQuery {String} sort a field to sort users according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Object[]} users array containing Users information.
 * @apiSuccess (Success 200) {String} pageNumber number of page received.
 * @apiSuccess (Success 200) {String} pageSize size of page received.
 * @apiSuccess (Success 200) {String} length length of data received.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "pageNumber": "4",
 *       "pageSize": "2",
 *       "length": 2,
 *       "users": [
 *         {
 *           "_id": "647e4fc08ef18203fec14426",
 *           "name": "User 02",
 *           "email": "user02@gmail.com",
 *           "isVerified": true,
 *           "status": "active",
 *           "accountType": "client",
 *           "phoneNumber": "01293713538",
 *           "address": "address 02",
 *           "birthday": "2003-06-05T00:00:00.000Z",
 *           "gender": "male",
 *           "createdAt": "2023-06-05T21:12:32.790Z",
 *           "updatedAt": "2023-06-05T21:12:32.790Z",
 *           "__v": 0
 *         },
 *         {
 *           "_id": "647e4fc18ef18203fec14428",
 *           "name": "User 03",
 *           "email": "user03@gmail.com",
 *           "isVerified": true,
 *           "status": "active",
 *           "accountType": "client",
 *           "phoneNumber": "01161937364",
 *           "address": "address 03",
 *           "birthday": "1994-06-05T00:00:00.000Z",
 *           "gender": "female",
 *           "createdAt": "2023-06-05T21:12:33.020Z",
 *           "updatedAt": "2023-06-05T21:12:33.020Z",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user/refresh-token Refresh JWT
 * @apiName RefreshJWT
 * @apiGroup User
 * @apiDescription Used to request a new token for authentication the token will be sent in a header field 'x-auth-token'
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Client
 *
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user/stats Get Stats
 * @apiName GetStats
 * @apiGroup User
 * @apiDescription Used to request the number of users with a given query
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Admin
 *
 * @apiQuery {String="admin","vendor","client"} accountType User account type.
 * @apiQuery {String="male","female"} gender User gender.
 * @apiQuery {String} date should be in format of YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD (from,to).
 *
 * @apiSuccess (Success 200) {String} length length of data received.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 15
 *     }
 *
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/user Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiDescription Used to delete a user from the database
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Admin
 *
 * @apiBody {String} id id of the User to be deleted.
 *
 * @apiSuccess (Success 200) {String} delete if true the user is deleted.
 * @apiSuccess (Success 200) {Object} user contains User information.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "delete": true,
 *       "user": {
 *         "_id": "648a029430547d41c644373b",
 *         "name": "test",
 *         "email": "36dba90e6a@mymaily.lol",
 *         "isVerified": true,
 *         "status": "active",
 *         "accountType": "vendor",
 *         "phoneNumber": "01234567899",
 *         "address": "address",
 *         "birthday": "2005-06-21T00:00:00.000Z",
 *         "gender": "male",
 *         "createdAt": "2023-06-14T18:10:29.046Z",
 *         "updatedAt": "2023-06-14T18:13:05.914Z",
 *         "__v": 2
 *       }
 *     }
 *
 * @apiUse IdBadRequestError
 * @apiUse UserNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/ban Ban User
 * @apiName BanUser
 * @apiGroup User
 * @apiDescription Used to ban a user
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Admin
 *
 * @apiBody {String} id id of the User to be banned.
 *
 * @apiSuccess (Success 200) {Object} user contains User information.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "_id": "648a029430547d41c644373b",
 *         "name": "test",
 *         "email": "36dba90e6a@mymaily.lol",
 *         "isVerified": true,
 *         "status": "banned",
 *         "accountType": "vendor",
 *         "phoneNumber": "01234567899",
 *         "address": "address",
 *         "birthday": "2005-06-21T00:00:00.000Z",
 *         "gender": "male",
 *         "createdAt": "2023-06-14T18:10:29.046Z",
 *         "updatedAt": "2023-06-14T18:13:05.914Z",
 *         "__v": 2
 *       }
 *     }
 *
 * @apiUse IdBadRequestError
 * @apiUse UserNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/signup Signup
 * @apiName Signup
 * @apiGroup User
 * @apiDescription Used to signup a user (create new account) (for the errors of a bad body we only showed the name but it applies to all other body fields)
 *
 * @apiPermission none
 *
 * @apiBody {String} name name of the User length btw 3-55.
 * @apiBody {String} email user email must be a valid email (must be unique).
 * @apiBody {String} phoneNumber user phone number must be a valid egyptian phone number (must be unique).
 * @apiBody {String} password user password (btw 8-30, have a 1 lowerCase, 1 upperCase, 1 symbol).
 * @apiBody {String} [confirmPassword] confirm password must match the password.
 * @apiBody {String} [birthday] user birthday.
 * @apiBody {String="male","female"} [gender] user gender.
 * @apiBody {String} [city] user city.
 * @apiBody {String} [address] user address.
 * @apiBody {String} [companyName] user company name.
 * @apiBody {String} [businessAddress] user business address.
 * @apiBody {String} [websiteAddress] user website address.
 * @apiBody {Boolean} [isVendor] if the user want to apply a vendor request.
 *
 * @apiSuccess (Success 200) {String} signup if true the signup is successful.
 * @apiSuccess (Success 200) {Object} user contains User information.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "signup": true,
 *       "user": {
 *         "name": "مهند",
 *         "email": "test@gmail.com",
 *         "isVerified": false,
 *         "status": "active",
 *         "password": "$2a$10$genipLJoeHHV7tRLg7uKIeI8vM2BAlxbY4PKWpmQh0OjH6crtldNW",
 *         "accountType": "client",
 *         "phoneNumber": "01154292123",
 *         "birthday": "2000-09-30T22:00:00.000Z",
 *         "gender": "male",
 *         "_id": "648b747d043d3adb50fa9b85",
 *         "token": "d800770e20d0faac29e1995568fe943d",
 *         "expireAt": "2023-06-17T00:00:00.000Z",
 *         "createdAt": "2023-06-15T20:28:48.636Z",
 *         "updatedAt": "2023-06-15T20:28:48.636Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse NameBadRequestError
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user/verify Verify User
 * @apiName VerifyUser
 * @apiGroup User
 * @apiDescription Used to verify a user email address. in success the user is redirected to his profile and the email is verified
 *
 * @apiPermission none
 *
 * @apiQuery {String} token User unique token sent to his email.
 *
 * @apiUse UserNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user/resend-verify Resend Verify User
 * @apiName ResendVerifyUser
 * @apiGroup User
 * @apiDescription Used to resend a verify email to the user. in success the user will receive the email
 *
 * @apiUse AuthorizationHeader
 * @apiPermission Client
 *
 * @apiQuery {String} token User unique token sent to his email.
 *
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/forget-password Forget Password
 * @apiName ForgetPassword
 * @apiGroup User
 * @apiDescription used when user forgets his password so he sends his email and will be sent a link to his email to reset his password
 *
 * @apiPermission none
 *
 * @apiBody {String} email the email of the user.
 *
 * @apiSuccess (Success 200) {String} message message to let the user know the email is sent.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Email sent to reset your password."
 *     }
 *
 * @apiUse EmailBadRequestError
 * @apiUse UserNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user/forget-password Forget Password Redirect
 * @apiName ForgetPasswordRedirect
 * @apiGroup User
 * @apiDescription used to verify the token sent to the user and redirect to reset password page
 *
 * @apiPermission none
 *
 * @apiQuery {String} token User unique token sent to his email.
 *
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/reset-password Reset Password
 * @apiName ResetPassword
 * @apiGroup User
 * @apiDescription used to reset the user password with the code from his mail
 *
 * @apiPermission none
 *
 * @apiBody {String} password user password (btw 8-30, have a 1 lowerCase, 1 upperCase, 1 symbol).
 * @apiBody {String} code user code from his mail.
 *
 * @apiSuccess (Success 200) {String} message message to let the user know the email is sent.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "password changed."
 *     }
 *
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/login Login
 * @apiName Login
 * @apiGroup User
 * @apiDescription used to login the user with email and password
 *
 * @apiPermission none
 *
 * @apiBody {String} email user email must be a valid email.
 * @apiBody {String} password user password (btw 8-30, have a 1 lowerCase, 1 upperCase, 1 symbol).
 *
 * @apiSuccess (Success 200) {String} login if true the login is successful.
 * @apiSuccess (Success 200) {Object} user contains User information.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "login": true,
 *       "user": {
 *         "_id": "647e4fc08ef18203fec14421",
 *         "name": "Ahmed",
 *         "email": "ahmed@gmail.com",
 *         "isVerified": true,
 *         "status": "active",
 *         "password": "$2a$10$PFeCh3PShL4El1QL44XXYec6wTG.Ppa0JMlOL3TbJgpNwoYvVVk9u",
 *         "accountType": "admin",
 *         "phoneNumber": "01162644103",
 *         "address": "address",
 *         "birthday": "1994-06-05T00:00:00.000Z",
 *         "gender": "male",
 *         "createdAt": "2023-06-05T21:12:32.194Z",
 *         "updatedAt": "2023-06-15T20:50:43.276Z",
 *         "__v": 1
 *       }
 *     }
 *
 * @apiUse IncorrectPasswordError
 * @apiUse InternalServerError
 */

/**
 * @api {patch} /api/user/me Edit User Information
 * @apiName EditUserInformation
 * @apiGroup User
 * @apiDescription Used to edit the user information (for the errors of a bad body we only showed the name but it applies to all other body fields)
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} name name of the User length btw 3-55.
 * @apiBody {String} email user email must be a valid email (must be unique).
 * @apiBody {String} phoneNumber user phone number must be a valid egyptian phone number (must be unique).
 * @apiBody {String} [birthday] user birthday.
 * @apiBody {String="male","female"} [gender] user gender.
 * @apiBody {String} [city] user city.
 * @apiBody {String} [address] user address.
 * @apiBody {String} [companyName] user company name.
 * @apiBody {String} [businessAddress] user business address.
 * @apiBody {String} [websiteAddress] user website address.
 *
 * @apiSuccess (Success 200) {String} signup if true the signup is successful.
 * @apiSuccess (Success 200) {Object} user contains User information.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "user": {
 *         "_id": "647e4fc08ef18203fec14421",
 *         "name": "ahmed",
 *         "email": "admin@gmail.com",
 *         "isVerified": true,
 *         "status": "active",
 *         "accountType": "admin",
 *         "phoneNumber": "01126370083",
 *         "address": "address",
 *         "birthday": "1999-03-31T22:00:00.000Z",
 *         "gender": "male",
 *         "createdAt": "2023-06-05T21:12:32.194Z",
 *         "updatedAt": "2023-06-15T21:07:01.071Z",
 *         "__v": 2
 *       }
 *     }
 *
 * @apiUse NameBadRequestError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/vendor-req Vendor Request
 * @apiName VendorRequest
 * @apiGroup User
 * @apiDescription Used to apply a vendor request
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} details details of the request.
 *
 * @apiSuccess (Success 200) {String} message message to let the user know the email is sent.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "vendor request submitted"
 *     }
 *
 * @apiError ClientOnly only client can apply a request
 * @apiErrorExample {json} 400 Client only Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "only client can make vendor requests"
 *     }
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/user/vendor-req Get Vendor Requests
 * @apiName GetVendorRequests
 * @apiGroup User
 * @apiDescription Used to get vendor requests
 *
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiSuccess (Success 200) {String} length number of the received requests.
 * @apiSuccess (Success 200) {Object[]} requests array of requests.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 1,
 *       "requests": [
 *         {
 *           "_id": "648b878fad6ed96247374055",
 *           "userId": {
 *             "_id": "647e4fc08ef18203fec14424",
 *             "name": "User 01",
 *             "email": "user01@gmail.com",
 *             "isVerified": true,
 *             "status": "active",
 *             "accountType": "client",
 *             "phoneNumber": "01004558913",
 *             "address": "address 01",
 *             "birthday": "1990-06-05T00:00:00.000Z",
 *             "gender": "female",
 *             "createdAt": "2023-06-05T21:12:32.553Z",
 *             "updatedAt": "2023-06-14T13:20:10.760Z",
 *             "__v": 2
 *           },
 *           "type": "vendor",
 *           "details": "want to be a vendor for ...",
 *           "createdAt": "2023-06-15T21:50:07.414Z",
 *           "updatedAt": "2023-06-15T21:50:07.414Z",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/user/vendor-req/:id Delete Vendor Request
 * @apiName DeleteVendorRequest
 * @apiGroup User
 * @apiDescription Used to delete a vendor request
 *
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id User's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} request deleted request details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "request": {
 *         "_id": "648b878fad6ed96247374055",
 *         "userId": "647e4fc08ef18203fec14424",
 *         "type": "vendor",
 *         "details": "want to be a vendor for ...",
 *         "createdAt": "2023-06-15T21:50:07.414Z",
 *         "updatedAt": "2023-06-15T21:50:07.414Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse UserNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/me/changePassword Change Password
 * @apiName ChangePassword
 * @apiGroup User
 * @apiDescription Used to change the user password
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} oldPassword user oldPassword.
 * @apiBody {String} newPassword user newPassword (btw 8-30, have a 1 lowerCase, 1 upperCase, 1 symbol).
 *
 * @apiSuccess (Success 200) {Boolean} update if true the password changed successfully.
 * @apiSuccess (Success 200) {Object} user the user information after changing the password and a new login token.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "user": {
 *         "_id": "647e4fc08ef18203fec14421",
 *         "name": "ahmed",
 *         "email": "admin@gmail.com",
 *         "isVerified": true,
 *         "status": "active",
 *         "password": "$2a$10$ZE9ygUCH76/h2wdU1V/JquihplTFXAWuL6CCjVcoEMtXfIpCLbcsK",
 *         "accountType": "admin",
 *         "phoneNumber": "01126370083",
 *         "address": "address",
 *         "birthday": "1999-03-31T22:00:00.000Z",
 *         "gender": "male",
 *         "createdAt": "2023-06-05T21:12:32.194Z",
 *         "updatedAt": "2023-06-15T22:13:57.324Z",
 *         "__v": 3
 *       }
 *     }
 *
 * @apiUse IncorrectPasswordError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/user/changeAccountType/:id Change Account Type
 * @apiName ChangeAccountType
 * @apiGroup User
 * @apiDescription Used to change the user account type by admin
 *
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id User's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Boolean} update if true the password changed successfully.
 * @apiSuccess (Success 200) {Object} user the user information after changing the accountType.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "user": {
 *         "name": "Mohannad Ragab",
 *         "accountType": "vendor"
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse UserNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @apiDefine Admin Admin
 * has all the permissions for the site
 */

/**
 * @apiDefine Vendor Vendor
 * has all the permissions to control his products, coupons and orders
 */

/**
 * @apiDefine Client Client
 * a logged in user.
 */

/**
 * @apiDefine IncorrectPasswordError
 * @apiError IncorrectPassword The <code>password</code> sent is incorrect.
 * @apiErrorExample {json} 400 Incorrect Password Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Password is incorrect"
 *     }
 */

/**
 * @apiDefine BadIdError
 * @apiError BadId The <code>id</code> sent is not a valid mongo id.
 * @apiErrorExample {json} 400 Bad Id Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "Invalid object Id."
 *     }
 */

/**
 * @apiDefine IdBadRequestError
 * @apiError IdBadRequest The <code>id</code> sent is not a valid mongo id.
 * @apiErrorExample {json} 400 Bad Body Id Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "id with value {value} fails to match the valid mongo id pattern. "
 *     }
 */

/**
 * @apiDefine NameBadRequestError
 * @apiError NameError The <code>name</code> of the User doesn't match (2-255 length, start with a letter).
 * @apiErrorExample {json} 400 Bad Name Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "name length must be at least 3 characters long. name should start with a letter. "
 *     }
 */

/**
 * @apiDefine EmailBadRequestError
 * @apiError EmailError The <code>email</code> of the User is not a valid email address.
 * @apiErrorExample {json} 400 Bad Email Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "email must be a valid email. "
 *     }
 */

/**
 * @apiDefine UserNotFoundError
 * @apiError UserNotFound The id of the User was not found.
 * @apiErrorExample {json} 404 User Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "User not found."
 *     }
 */

/**
 * @apiDefine InternalServerError
 * @apiError (Internal Server Error 500) InternalServerError The server encountered an internal error.
 * @apiErrorExample {json} 500 Internal Server Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal Server Error",
 *       "code": "66eb6033613346919756edf14b7baae9"
 *     }
 */

/**
 * @apiDefine UserForbidden
 * @apiError UserForbidden The token of the User sent with the request doesn't have the permission for the request.
 * @apiErrorExample {json} 403 Forbidden Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Access denied."
 *     }
 */

/**
 * @apiDefine UserUnauthorized
 * @apiError UserUnauthorized The token of the User was not sent with the request.
 * @apiErrorExample {json} 401 Unauthorized Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Access denied.",
 *       "reason": "No token provided."
 *     }
 */

/**
 * @apiDefine UserAuthorizationBadRequest
 * @apiError UserAuthorizationBadRequest The token sent with the request is not in jwt format.
 * @apiErrorExample {json} 400 Authorization Bad Request Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Access denied.",
 *       "reason": "jwt malformed"
 *     }
 */

/**
 * @apiDefine AuthorizationHeader
 * @apiHeader {String} Authorization The JWT (JsonWebToken) sent to the user when logged in.
 * @apiHeaderExample {json} Authorization Header Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDdlNGZjMDhlZjE4MjAzZmVjMTQ0MjEiLCJuYW1lIjoiYWhtZWQiLCJhY2NvdW50VHlwZSI6ImFkbWluIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIl9fdiI6NCwiaWF0IjoxNjg2OTI1NzQ0LCJleHAiOjE2ODc1MzA1NDQsImlzcyI6ImVjb21tZXJjZV93ZWIifQ.AMr6jOMt4_MFwrwEJoTg9djsYUg8zWN6mqjnccXrjoA"
 *     }
 *
 */
