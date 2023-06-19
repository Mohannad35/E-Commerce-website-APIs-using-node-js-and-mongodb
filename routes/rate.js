import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import RateValidator from '../validation/rate.js';
import RateController from '../controller/rate.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();

// fetch all rates
router.get('/', [validate('query', RateValidator.getRates)], RateController.rates);

// fetch an rate
router.get('/:id', [validateObjectId], RateController.rate);

// create an rate
router.post('/', [auth, validate('body', RateValidator.addRate)], RateController.addRate);

// update an rate
router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', RateValidator.editRate)],
	RateController.updateRate
);

// delete rate
router.delete('/:id', [auth, validateObjectId], RateController.deleteRate);

export default router;

// api documentation
/**
 * @api {get} /api/rate Get All Rate
 * @apiName GetAllRates
 * @apiGroup Rate
 * @apiDescription Used to get all rates (all queries errors are just like ID error in example)
 *
 * @apiPermission none
 * 
 * @apiQuery {String} itemId Id of the item to sent all rates for (must be a valid mongoID).
 * @apiQuery {String} userId Id of the user to sent all rates for (must be a valid mongoID).
 * @apiQuery {Number} pageNumber number ofd page to be sent (must be a positive integer).
 * @apiQuery {Number} pageSize size of page to be sent (must be a positive integer).
 * @apiQuery {String} sort a field to sort rates according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Number} length number of received rates.
 * @apiSuccess (Success 200) {Number} total number of total rates.
 * @apiSuccess (Success 200) {Number} remaining number of remaining rates.
 * @apiSuccess (Success 200) {Object} paginationResult pagination details for front-end view.
 * @apiSuccess (Success 200) {Object[]} rates the received rates.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 1,
 *       "total": 1,
 *       "remaining": 0,
 *       "paginationResult": {
 *         "currentPage": 1,
 *         "numberOfPages": 1,
 *         "limit": 20
 *       },
 *       "rates": [
 *         {
 *           "_id": "648a11adb7955c6a0bff7219",
 *           "userId": {
 *             "_id": "647e4fc18ef18203fec1442c",
 *             "name": "User 05",
 *             "email": "user05@gmail.com"
 *           },
 *           "itemId": "6489f8a830547d41c644341a",
 *           "rateValue": 4.5,
 *           "review": "منتج جيد",
 *           "createdAt": "2023-06-14T19:14:53.887Z",
 *           "updatedAt": "2023-06-14T19:14:53.887Z",
 *           "slug": "647e4fc18ef18203fec1442c-6489f8a830547d41c644341a",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse BadIdError
 * @apiUse RateNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/rate/:id Get Rate
 * @apiName GetRate
 * @apiGroup Rate
 * @apiDescription Used to get a rate
 *
 * @apiPermission none
 * @apiParam {String} id Rate's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} rate received rate details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "rate": {
 *         "_id": "648a11adb7955c6a0bff7219",
 *         "userId": "647e4fc18ef18203fec1442c",
 *         "itemId": "6489f8a830547d41c644341a",
 *         "rateValue": 4.5,
 *         "review": "منتج جيد",
 *         "createdAt": "2023-06-14T19:14:53.887Z",
 *         "updatedAt": "2023-06-14T19:14:53.887Z",
 *         "slug": "647e4fc18ef18203fec1442c-6489f8a830547d41c644341a",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse RateNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/rate Add Rate
 * @apiName AddRate
 * @apiGroup Rate
 * @apiDescription Used to add a new rate
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} itemId the Id of the item to be rated (must be a valid mongoID).
 * @apiBody {Number} rateValue the value of the rate (must be a positive integer).
 * @apiBody {String} review the comment (details) of the review (must be a string).
 * @apiExample {json} Request Body Example:
 *     {
 *       "itemId": "6489f71e30547d41c6443340",
 *       "rateValue": 5,
 *       "review": "منتج جيد جدا"
 *     }
 *
 * @apiSuccess (Success 200) {Boolean} create if true the rate added successfully.
 * @apiSuccess (Success 200) {Object} rate added rate details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "create": true,
 *       "rate": {
 *         "userId": "647e4fc18ef18203fec14428",
 *         "itemId": "6489f71e30547d41c6443340",
 *         "rateValue": 5,
 *         "review": "منتج جيد جدا",
 *         "_id": "648cf61e378f56f8c186a815",
 *         "createdAt": "2023-06-16T23:54:06.103Z",
 *         "updatedAt": "2023-06-16T23:54:06.103Z",
 *         "slug": "647e4fc18ef18203fec14428-6489f71e30547d41c6443340",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {patch} /api/rate/:id Edit Rate
 * @apiName EditRate
 * @apiGroup Rate
 * @apiDescription Used to edit a rate
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Rate's unique ID in DB.
 *
 * @apiBody {Number} [rateValue] the value of the rate (must be a positive integer).
 * @apiBody {String} [review] the comment (details) of the review (must be a string).
 * @apiExample {json} Request Body Example:
 *     {
 *       "rateValue": 4.5,
 *       "review": "منتج جيد"
 *     }
 *
 * @apiSuccess (Success 200) {Boolean} update if true the rate edited successfully.
 * @apiSuccess (Success 200) {Object} rate edited rate details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "rate": {
 *         "_id": "648cf61e378f56f8c186a815",
 *         "userId": "647e4fc18ef18203fec14428",
 *         "itemId": "6489f71e30547d41c6443340",
 *         "rateValue": 4.5,
 *         "review": "منتج جيد",
 *         "createdAt": "2023-06-16T23:54:06.103Z",
 *         "updatedAt": "2023-06-17T00:00:32.679Z",
 *         "slug": "647e4fc18ef18203fec14428-6489f71e30547d41c6443340",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse RateNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/rate/:id Delete Rate
 * @apiName DeleteRate
 * @apiGroup Rate
 * @apiDescription Used to delete a rate
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Rate's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Boolean} delete if true the rate deleted successfully.
 * @apiSuccess (Success 200) {Object} rate deleted rate details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "delete": true,
 *       "rate": {
 *         "_id": "648cf61e378f56f8c186a815",
 *         "userId": "647e4fc18ef18203fec14428",
 *         "itemId": "6489f71e30547d41c6443340",
 *         "rateValue": 4.5,
 *         "review": "منتج جيد",
 *         "createdAt": "2023-06-16T23:54:06.103Z",
 *         "updatedAt": "2023-06-17T00:00:32.679Z",
 *         "slug": "647e4fc18ef18203fec14428-6489f71e30547d41c6443340",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse RateNotFoundError
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
 * @apiDefine RateNotFoundError
 * @apiError RateNotFound The id of the Rate was not found.
 * @apiErrorExample {json} 404 Rate Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Rate not found."
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
