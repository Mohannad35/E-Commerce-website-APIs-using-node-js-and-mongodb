import { Router } from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import CartValidator from './../validation/cart.js';
import CartController from '../controller/cart.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// get cart items
router.get('/', [auth, validate('query', CartValidator.getCart)], CartController.getCartItems);

// add item to cart
router.post(
	'/:id',
	[auth, validateObjectId, validate('body', CartValidator.cart)],
	CartController.addItemToCart
);

// add items to cart
router.post('/', [auth, validate('body', CartValidator.cartItems)], CartController.addItemsToCart);

// reduce item quantity in cart or remove it from cart
router.delete(
	'/:id',
	[auth, validateObjectId, validate('body', CartValidator.quantity)],
	CartController.deleteItemFromCart
);

router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', CartValidator.quantity)],
	CartController.editItemInCart
);

export default router;

// api documentation
/**
 * @api {get} /api/cart Get Cart Items
 * @apiName GetCartItems
 * @apiGroup Cart
 * @apiDescription Used to get all cart items. (empty response if cart is empty)
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiQuery {String="true", "false", ""} [full] if true then the cart items will be populated.
 *
 * @apiSuccess (Success 200) {String} cartid id of the cart.
 * @apiSuccess (Success 200) {Object} cart the received cart.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cartid": "648f555c2efe4757e71c30f3",
 *       "cart": {
 *         "_id": "648f555c2efe4757e71c30f3",
 *         "owner": {
 *           "_id": "647e4fc18ef18203fec14428",
 *           "name": "User 03"
 *         },
 *         "coupon": [],
 *         "items": [
 *           {
 *             "item": "648d966ddab23f0a0192f152",
 *             "name": "Mobile 5",
 *             "quantity": 1,
 *             "price": 8600,
 *             "img": [
 *               "http://localhost:5000/images/images-1687000685398-194677317.png",
 *               "http://localhost:5000/images/images-1687000685399-930084692.png",
 *               "http://localhost:5000/images/images-1687000685441-449606022.png"
 *             ],
 *             "category": "Mobiles",
 *             "brand": "Samsung",
 *             "rating": "3.5"
 *           }
 *         ],
 *         "bill": 8600,
 *         "billBefore": 8600,
 *         "createdAt": "2023-06-18T19:05:00.860Z",
 *         "updatedAt": "2023-06-18T19:05:00.860Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/cart/:id Add Item To Cart
 * @apiName AddItemToCart
 * @apiGroup Cart
 * @apiDescription Used to add item to cart. (id in params is for the item and the cart will be gotten from the logged in user)
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Item's unique ID in DB.
 *
 * @apiBody {String} quantity quantity of the item to be added. (string containing numbers only)
 * @apiExample {json} Request Body Example:
 *     {
 *       "quantity": "1"
 *     }
 *
 * @apiSuccess (Success 200) {String} cartid id of the cart.
 * @apiSuccess (Success 200) {String} update if true the cart is updated and added the item to it.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cartid": "648f555c2efe4757e71c30f3",
 *       "update": true
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/cart Add Items To Cart
 * @apiName AddItemsToCart
 * @apiGroup Cart
 * @apiDescription Used to add items to cart.
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {Object[]} items items to be added (_id and quantity fields only).
 * @apiExample {json} Request Body Example:
 *     {
 *       "items": [
 *         {
 *           "_id": "648d9884dab23f0a0192f199",
 *           "quantity": 2
 *         }
 *       ]
 *     }
 *
 * @apiSuccess (Success 200) {String} cartid id of the cart.
 * @apiSuccess (Success 200) {String} update if true the cart is updated and added the item to it.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cartid": "648f555c2efe4757e71c30f3",
 *       "update": true
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/cart/:id Delete Or Reduce Item From Cart
 * @apiName DeleteItemFromCart
 * @apiGroup Cart
 * @apiDescription Used to delete or reduce item quantity from cart.
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Item's unique ID in DB.
 *
 * @apiBody {String} quantity quantity of the item to be added. (string containing numbers only)
 * @apiExample {json} Request Body Example:
 *     {
 *       "quantity": "2"
 *     }
 *
 * @apiSuccess (Success 200) {String} cartid id of the cart.
 * @apiSuccess (Success 200) {String} update if true the cart is updated and added the item to it.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cartid": "648f555c2efe4757e71c30f3",
 *       "update": true
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {patch} /api/cart/:id Edit Item Quantity In Cart
 * @apiName EditItemQuantityInCart
 * @apiGroup Cart
 * @apiDescription Used to edit item quantity in cart.
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Item's unique ID in DB.
 *
 * @apiBody {String} quantity quantity of the item to be added. (string containing numbers only)
 * @apiExample {json} Request Body Example:
 *     {
 *       "quantity": "2"
 *     }
 *
 * @apiSuccess (Success 200) {String} cartid id of the cart.
 * @apiSuccess (Success 200) {String} update if true the cart is updated and added the item to it.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "cartid": "648f555c2efe4757e71c30f3",
 *       "update": true
 *     }
 *
 * @apiUse ItemNotFoundError
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
 * @apiDefine CartNotFoundError
 * @apiError CartNotFound The id or code of the cart was not found.
 * @apiErrorExample {json} 404 Cart Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Cart not found."
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
