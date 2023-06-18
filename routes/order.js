import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import OrderValidator from '../validation/order.js';
import OrderController from '../controller/order.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// get orders
router.get('/', [auth], OrderController.getOrders);

// get order by id
router.get('/:id', [auth, validateObjectId], OrderController.getOrder);

// checkout
router.post('/checkout', [auth, validate('body', OrderValidator.order)], OrderController.checkout);

// edit order status
router.patch('/:id', [auth, isVendor, validateObjectId], OrderController.editOrderStatus);

export default router;

/**
 * @api {get} /api/order Get All Orders
 * @apiName GetAllOrders
 * @apiGroup Order
 * @apiDescription Used to get all orders (all queries errors are just like ID error in example)
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiQuery {String} code order unique code.
 * @apiQuery {String} all if it equals string 'true' all orders will be sent (must be an Admin tho).
 * @apiQuery {Number} skip number of orders to be skipped while fetching from database.
 * @apiQuery {Number} limit number of orders to be fetched from database.
 * @apiQuery {Number} pageNumber number ofd page to be sent.
 * @apiQuery {Number} pageSize size of page to be sent.
 * @apiQuery {String} sort a field to sort rates according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Number} length number of received rates.
 * @apiSuccess (Success 200) {Number} total number of total rates.
 * @apiSuccess (Success 200) {Number} remaining number of remaining rates.
 * @apiSuccess (Success 200) {Object} paginationResult pagination details for front-end view.
 * @apiSuccess (Success 200) {Object[]} orders the received orders.
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
 *       "orders": [
 *         {
 *           "_id": "648d9932dab23f0a0192f34d",
 *           "code": "20230617GUAGL",
 *           "owner": {
 *             "_id": "647e4fc18ef18203fec14428",
 *             "name": "User 03",
 *             "email": "user03@gmail.com"
 *           },
 *           "contactPhone": "01161937364",
 *           "status": "pending",
 *           "paymentMethod": "cash",
 *           "address": "address 03",
 *           "coupon": [],
 *           "vendors": [
 *             "647e4fc18ef18203fec1442a",
 *             "647e4fc28ef18203fec14432"
 *           ],
 *           "items": [
 *             {
 *               "item": {
 *                 "_id": "648d966ddab23f0a0192f152",
 *                 "name": "Mobile 5",
 *                 "img": [
 *                   "http://localhost:5000/images/images-1687000685398-194677317.png",
 *                   "http://localhost:5000/images/images-1687000685399-930084692.png",
 *                   "http://localhost:5000/images/images-1687000685441-449606022.png"
 *                 ],
 *                 "description": "Mobile Samsung",
 *                 "quantity": 29,
 *                 "price": 8600,
 *                 "sold": 0,
 *                 "rating": 0,
 *                 "ratingCount": 0,
 *                 "category": "648a103764d65cd14084853d",
 *                 "owner": "647e4fc18ef18203fec1442a",
 *                 "brand": "641a8807dbb9e2bc99433e75",
 *                 "createdAt": "2023-06-17T11:18:05.447Z",
 *                 "updatedAt": "2023-06-17T11:29:55.014Z",
 *                 "__v": 0
 *               },
 *               "name": "Mobile 5",
 *               "quantity": 1,
 *               "price": 8600,
 *               "itemState": "pending"
 *             },
 *             {
 *               "item": {
 *                 "_id": "648d98bcdab23f0a0192f19d",
 *                 "name": "Mobile 5",
 *                 "img": [
 *                   "http://localhost:5000/images/images-1687001276801-846569544.png",
 *                   "http://localhost:5000/images/images-1687001276803-694899459.png",
 *                   "http://localhost:5000/images/images-1687001276804-499173175.png"
 *                 ],
 *                 "description": "Futuristic Mobile phone",
 *                 "quantity": 29,
 *                 "price": 9200,
 *                 "sold": 0,
 *                 "rating": 0,
 *                 "ratingCount": 0,
 *                 "category": "648a103764d65cd14084853d",
 *                 "owner": "647e4fc28ef18203fec14432",
 *                 "brand": "641a8807dbb9e2bc99433e75",
 *                 "createdAt": "2023-06-17T11:27:56.810Z",
 *                 "updatedAt": "2023-06-17T11:29:55.247Z",
 *                 "__v": 0
 *               },
 *               "name": "Mobile 5",
 *               "quantity": 1,
 *               "price": 9200,
 *               "itemState": "pending"
 *             }
 *           ],
 *           "bill": 17800,
 *           "billBefore": 17800,
 *           "createdAt": "2023-06-17T11:29:57.525Z",
 *           "updatedAt": "2023-06-17T11:29:57.525Z",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse UserForbidden
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/order/:id Get Order
 * @apiName GetOrder
 * @apiGroup Order
 * @apiDescription Used to get a order
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Order's unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} order the received order details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "order": {
 *         "_id": "648d9932dab23f0a0192f34d",
 *         "code": "20230617GUAGL",
 *         "owner": {
 *           "_id": "647e4fc18ef18203fec14428",
 *           "name": "User 03",
 *           "email": "user03@gmail.com"
 *         },
 *         "contactPhone": "01161937364",
 *         "status": "pending",
 *         "paymentMethod": "cash",
 *         "address": "address 03",
 *         "coupon": [],
 *         "vendors": [
 *           "647e4fc18ef18203fec1442a",
 *           "647e4fc28ef18203fec14432"
 *         ],
 *         "items": [
 *           {
 *             "item": {
 *               "_id": "648d966ddab23f0a0192f152",
 *               "name": "Mobile 5",
 *               "img": [
 *                 "http://localhost:5000/images/images-1687000685398-194677317.png",
 *                 "http://localhost:5000/images/images-1687000685399-930084692.png",
 *                 "http://localhost:5000/images/images-1687000685441-449606022.png"
 *               ],
 *               "description": "Mobile Samsung",
 *               "quantity": 29,
 *               "price": 8600,
 *               "sold": 0,
 *               "rating": 0,
 *               "ratingCount": 0,
 *               "category": "648a103764d65cd14084853d",
 *               "owner": "647e4fc18ef18203fec1442a",
 *               "brand": "641a8807dbb9e2bc99433e75",
 *               "createdAt": "2023-06-17T11:18:05.447Z",
 *               "updatedAt": "2023-06-17T11:29:55.014Z",
 *               "__v": 0
 *             },
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 8600,
 *             "itemState": "pending"
 *           },
 *           {
 *             "item": {
 *               "_id": "648d98bcdab23f0a0192f19d",
 *               "name": "Mobile 5",
 *               "img": [
 *                 "http://localhost:5000/images/images-1687001276801-846569544.png",
 *                 "http://localhost:5000/images/images-1687001276803-694899459.png",
 *                 "http://localhost:5000/images/images-1687001276804-499173175.png"
 *               ],
 *               "description": "Futuristic Mobile phone",
 *               "quantity": 29,
 *               "price": 9200,
 *               "sold": 0,
 *               "rating": 0,
 *               "ratingCount": 0,
 *               "category": "648a103764d65cd14084853d",
 *               "owner": "647e4fc28ef18203fec14432",
 *               "brand": "641a8807dbb9e2bc99433e75",
 *               "createdAt": "2023-06-17T11:27:56.810Z",
 *               "updatedAt": "2023-06-17T11:29:55.247Z",
 *               "__v": 0
 *             },
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 9200,
 *             "itemState": "pending"
 *           }
 *         ],
 *         "bill": 17800,
 *         "billBefore": 17800,
 *         "createdAt": "2023-06-17T11:29:57.525Z",
 *         "updatedAt": "2023-06-17T11:29:57.525Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/order/checkout Checkout Order
 * @apiName CheckoutOrder
 * @apiGroup Order
 * @apiDescription Used to create a order from user's cart and checkout
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String="cash", "credit card"} paymentMethod payment method selected (must be a positive integer).
 * @apiBody {String} coupon coupon code for discount (must be a string).
 * @apiBody {String} address address to deliver to (must be a string).
 * @apiBody {String} contactPhone phone number for communication with delivery (must be a valid phone number).
 * @apiExample {json} Request Body Example:
 *     {
 *       "address": "some address",
 *       "contactPhone": "01234567891"
 *     }
 *
 * @apiSuccess (Success 200) {Boolean} create if true the order created successfully.
 * @apiSuccess (Success 200) {Object} order the received order details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "order": {
 *         "code": "20230617VJBIV",
 *         "owner": "647e4fc18ef18203fec14428",
 *         "contactPhone": "01234567891",
 *         "status": "pending",
 *         "paymentMethod": "cash",
 *         "address": "some address",
 *         "coupon": [],
 *         "vendors": [
 *           "647e4fc18ef18203fec1442a",
 *           "647e4fc28ef18203fec14432"
 *         ],
 *         "items": [
 *           {
 *             "item": "648d966ddab23f0a0192f152",
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 8600,
 *             "itemState": "pending"
 *           },
 *           {
 *             "item": "648d98bcdab23f0a0192f19d",
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 9200,
 *             "itemState": "pending"
 *           }
 *         ],
 *         "bill": 17800,
 *         "billBefore": 17800,
 *         "_id": "648d9cdddab23f0a0192f4e2",
 *         "createdAt": "2023-06-17T11:45:35.501Z",
 *         "updatedAt": "2023-06-17T11:45:35.501Z",
 *         "__v": 0
 *       },
 *       "create": true
 *     }
 *
 * @apiError BadPhoneNumber The <code>phoneNumber</code> sent is not a valid phone number.
 * @apiErrorExample {json} 400 Bad Phone Number Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "01234567 is not a valid phone number. "
 *     }
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {patch} /api/order/:id Edit Order Status
 * @apiName EditOrderStatus
 * @apiGroup Order
 * @apiDescription Used to edit an order status
 *
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Order's unique ID in DB.
 *
 * @apiBody {String='pending', 'on way', 'received', 'cancelled'} status status of the order (must change accordingly pending --> on way --> received, cancelled only from pending).
 * @apiExample {json} Request Body Example:
 *     {
 *       "status": "on way"
 *     }
 * 
 * @apiSuccess (Success 200) {Boolean} update if true the order updated successfully.
 * @apiSuccess (Success 200) {Object} order the received order details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "order": {
 *         "_id": "648d9932dab23f0a0192f34d",
 *         "code": "20230617GUAGL",
 *         "owner": "647e4fc18ef18203fec14428",
 *         "contactPhone": "01161937364",
 *         "status": "on way",
 *         "paymentMethod": "cash",
 *         "address": "address 03",
 *         "coupon": [],
 *         "vendors": [
 *           "647e4fc18ef18203fec1442a",
 *           "647e4fc28ef18203fec14432"
 *         ],
 *         "items": [
 *           {
 *             "item": "648d966ddab23f0a0192f152",
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 8600,
 *             "itemState": "pending"
 *           },
 *           {
 *             "item": "648d98bcdab23f0a0192f19d",
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 9200,
 *             "itemState": "pending"
 *           }
 *         ],
 *         "bill": 17800,
 *         "billBefore": 17800,
 *         "createdAt": "2023-06-17T11:29:57.525Z",
 *         "updatedAt": "2023-06-17T12:11:31.070Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
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
 * @apiDefine OrderNotFoundError
 * @apiError OrderNotFound The id of the order was not found.
 * @apiErrorExample {json} 404 Order Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Order not found."
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
