import { Router } from 'express';
import auth from '../middleware/auth.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import CouponValidator from '../validation/coupon.js';
import CouponController from '../controller/coupon.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();

router.get(
	'/',
	[auth, isVendor, validate('query', CouponValidator.getCoupons)],
	CouponController.coupons
);

router.get('/:id', [validateObjectId], CouponController.coupon);

router.post(
	'/apply-coupon',
	[auth, validate('body', CouponValidator.coupon)],
	CouponController.applyCoupon
);

router.post(
	'/cancel-coupon',
	[auth, validate('body', CouponValidator.coupon)],
	CouponController.cancelCoupon
);

router.post(
	'/',
	[auth, isVendor, validate('body', CouponValidator.addCoupon)],
	CouponController.addCoupon
);

router.patch(
	'/:id',
	[auth, isVendor, validateObjectId, validate('body', CouponValidator.updateCoupon)],
	CouponController.updateCoupon
);

router.delete('/:id', [auth, isVendor, validateObjectId], CouponController.deleteCoupon);

export default router;

// api documentation
/**
 * @api {get} /api/coupon Get All Coupons
 * @apiName GetAllCoupons
 * @apiGroup Coupon
 * @apiDescription Used to get all coupons in the database
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiQuery {String} [code] coupon code.
 * @apiQuery {Number} [pageNumber] number of page to be sent.
 * @apiQuery {Number} [pageSize] size of page to be sent.
 * @apiQuery {String} [sort] a field to sort users according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Number} length number of received coupons.
 * @apiSuccess (Success 200) {Number} total number of total coupons.
 * @apiSuccess (Success 200) {Object} [paginationResult] pagination details for front-end view.
 * @apiSuccess (Success 200) {Object[]} coupons the received coupons.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 1,
 *       "total": 1,
 *       "paginationResult": {
 *         "currentPage": 1,
 *         "numberOfPages": 1,
 *         "limit": 12
 *       },
 *       "coupons": [
 *         {
 *           "_id": "6489f8c630547d41c644341d",
 *           "code": "ABC1234",
 *           "discount": 10,
 *           "validFrom": "2023-06-14T00:00:00.000Z",
 *           "expireAt": "2023-07-04T00:00:00.000Z",
 *           "vendor": "647e4fc28ef18203fec14432",
 *           "createdAt": "2023-06-14T17:28:38.211Z",
 *           "updatedAt": "2023-06-14T17:28:38.211Z",
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
 * @api {get} /api/coupon/:id Get Coupon
 * @apiName GetCoupon
 * @apiGroup Coupon
 * @apiDescription Used to get a coupon from the database
 * @apiPermission none
 *
 * @apiParam {String} id Coupon's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} coupon the received coupon details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "coupon": {
 *         "_id": "6489f8c630547d41c644341d",
 *         "code": "ABC1234",
 *         "discount": 10,
 *         "validFrom": "2023-06-14T00:00:00.000Z",
 *         "expireAt": "2023-07-04T00:00:00.000Z",
 *         "vendor": "647e4fc28ef18203fec14432",
 *         "createdAt": "2023-06-14T17:28:38.211Z",
 *         "updatedAt": "2023-06-14T17:28:38.211Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse CouponNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/coupon/apply-coupon Apply Coupon
 * @apiName ApplyCoupon
 * @apiGroup Coupon
 * @apiDescription Used to apply a coupon on cart or order at checkout
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} code code of the coupon to be applied.
 * @apiExample {json} Request Body Example:
 *     {
 *       "code": "ABC123"
 *     }
 *
 * @apiSuccess (Success 200) {Object} coupon the received coupon details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cart": {
 *         "_id": "648e220a4b9e270b9ea764b3",
 *         "owner": "647e4fc28ef18203fec14432",
 *         "coupon": [
 *           "ABC123"
 *         ],
 *         "items": [
 *           {
 *             "item": "648d9622dab23f0a0192f142",
 *             "name": "Laptop 5",
 *             "quantity": 2,
 *             "price": 33000,
 *             "img": [
 *               "http://localhost:5000/images/images-1687000610267-320637727.png",
 *               "http://localhost:5000/images/images-1687000610267-234075806.png",
 *               "http://localhost:5000/images/images-1687000610268-234962861.png"
 *             ],
 *             "category": "Laptops",
 *             "brand": "Lenovo",
 *             "rating": "0",
 *             "priceAfter": 29700
 *           }
 *         ],
 *         "bill": 59400,
 *         "billBefore": 66000,
 *         "createdAt": "2023-06-17T21:13:47.345Z",
 *         "updatedAt": "2023-06-17T21:13:57.916Z",
 *         "__v": 1
 *       }
 *     }
 *
 * @apiUse CouponNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/coupon/cancel-coupon Cancel Coupon
 * @apiName CancelCoupon
 * @apiGroup Coupon
 * @apiDescription Used to cancel (remove discount) a coupon applied on cart or order at checkout
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} code code of the coupon to be applied.
 * @apiExample {json} Request Body Example:
 *     {
 *       "code": "ABC123"
 *     }
 *
 * @apiSuccess (Success 200) {Object} coupon the received coupon details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cart": {
 *         "_id": "648e220a4b9e270b9ea764b3",
 *         "owner": "647e4fc28ef18203fec14432",
 *         "coupon": [],
 *         "items": [
 *           {
 *             "item": "648d9622dab23f0a0192f142",
 *             "name": "Laptop 5",
 *             "quantity": 2,
 *             "price": 33000,
 *             "img": [
 *               "http://localhost:5000/images/images-1687000610267-320637727.png",
 *               "http://localhost:5000/images/images-1687000610267-234075806.png",
 *               "http://localhost:5000/images/images-1687000610268-234962861.png"
 *             ],
 *             "category": "Laptops",
 *             "brand": "Lenovo",
 *             "rating": "0"
 *           }
 *         ],
 *         "bill": 66000,
 *         "billBefore": 66000,
 *         "createdAt": "2023-06-17T21:13:47.345Z",
 *         "updatedAt": "2023-06-17T21:14:39.686Z",
 *         "__v": 2
 *       }
 *     }
 *
 * @apiUse CouponNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/coupon Add Coupon
 * @apiName AddCoupon
 * @apiGroup Coupon
 * @apiDescription Used to Add a new coupon
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} code code of the coupon to be applied.
 * @apiBody {Number} discount discount amount as percentage (0 - 100).
 * @apiBody {String} [expireAt=10DaysFromNow] date of expiration of the coupon (default is today + 10 days).
 * @apiBody {String} [validFrom=Now] date of validation of the coupon (default is today).
 * @apiExample {json} Request Body Example:
 *     {
 *       "code": "ABC123",
 *       "discount": 10,
 *       "expireAt": "2023-07-10",
 *       "validFrom": "2023-06-10"
 *     }
 *
 * @apiSuccess (Success 200) {Object} coupon the received coupon details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "create": true,
 *       "coupon": {
 *         "code": "ABC12345",
 *         "discount": 10,
 *         "validFrom": "2023-06-17T21:10:04.945Z",
 *         "expireAt": "2023-07-10T00:00:00.000Z",
 *         "vendor": "647e4fc28ef18203fec14432",
 *         "_id": "648e22724b9e270b9ea764c5",
 *         "createdAt": "2023-06-17T21:15:30.649Z",
 *         "updatedAt": "2023-06-17T21:15:30.649Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {patch} /api/coupon/:id Update Coupon
 * @apiName UpdateCoupon
 * @apiGroup Coupon
 * @apiDescription Used to update a coupon (at least on of the body fields must exist)
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Coupon's unique ID in DB.
 *
 * @apiBody {String} [code] code of the coupon to be applied.
 * @apiBody {Number} [discount] discount amount as percentage (0 - 100).
 * @apiBody {String} [expireAt] date of expiration of the coupon.
 * @apiBody {String} [validFrom] date of validation of the coupon.
 * @apiExample {json} Request Body Example:
 *     {
 *       "code": "ABC1234",
 *       "discount": 20
 *     }
 *
 * @apiSuccess (Success 200) {Object} coupon the received coupon details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "coupon": {
 *         "_id": "648e22724b9e270b9ea764c5",
 *         "code": "ABC12345",
 *         "discount": 20,
 *         "validFrom": "2023-06-17T21:10:04.945Z",
 *         "expireAt": "2023-07-10T00:00:00.000Z",
 *         "vendor": "647e4fc28ef18203fec14432",
 *         "createdAt": "2023-06-17T21:15:30.649Z",
 *         "updatedAt": "2023-06-17T21:16:16.634Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse CouponNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/coupon/:id Delete Coupon
 * @apiName DeleteCoupon
 * @apiGroup Coupon
 * @apiDescription Used to delete a coupon
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Coupon's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} coupon the received coupon details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "delete": true,
 *       "coupon": {
 *         "_id": "648e22724b9e270b9ea764c5",
 *         "code": "ABC12345",
 *         "discount": 20,
 *         "validFrom": "2023-06-17T21:10:04.945Z",
 *         "expireAt": "2023-07-10T00:00:00.000Z",
 *         "vendor": "647e4fc28ef18203fec14432",
 *         "createdAt": "2023-06-17T21:15:30.649Z",
 *         "updatedAt": "2023-06-17T21:16:16.634Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse CouponNotFoundError
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
 * @apiDefine CouponNotFoundError
 * @apiError CouponNotFound The id or code of the coupon was not found.
 * @apiErrorExample {json} 404 Coupon Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Coupon not found."
 *     }
 */

/**
 * @apiDefine ItemNotFoundError
 * @apiError ItemNotFound The id of the Item was not found.
 * @apiErrorExample {json} 404 Item Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Item not found"
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
