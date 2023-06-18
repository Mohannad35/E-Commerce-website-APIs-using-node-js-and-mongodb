import { Router } from 'express';
import _ from 'lodash';
import multer from 'multer';
import auth from '../middleware/auth.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import ItemValidator from '../validation/item.js';
import ItemController from '../controller/item.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();
const storage = multer.diskStorage({
	destination: 'public/images',
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
	}
});
const upload = multer({ storage });

// fetch all items
router.get('/', [validate('query', ItemValidator.getItems)], ItemController.items);

// fetch an item
router.get('/:id', [validateObjectId], ItemController.getOneItem);

// create an item
router.post(
	'/',
	[upload.array('images', 5), auth, isVendor, validate('body', ItemValidator.addItem)],
	ItemController.addItem
);

// update an item
router.patch(
	'/:id',
	[
		upload.array('images', 5),
		auth,
		isVendor,
		validateObjectId,
		validate('body', ItemValidator.updateItem)
	],
	ItemController.updateItem
);

// delete item
router.delete('/:id', [auth, isVendor, validateObjectId], ItemController.deleteItem);

export default router;

// api documentation
/**
 * @api {get} /api/item Get All Items
 * @apiName GetAllItems
 * @apiGroup Item
 * @apiDescription Used to get all items in the database
 * @apiPermission none
 *
 * @apiQuery {String} [name] Item name.
 * @apiQuery {Number} [to] price to send items with lower price than it.
 * @apiQuery {Number} [from] price to send items with higher price than it.
 * @apiQuery {String} [brand] brand id for filtering (must be a valid mongo id).
 * @apiQuery {String} [owner] the item owner id for filtering (must be a valid mongo id).
 * @apiQuery {String} [category] category id for filtering (must be a valid mongo id).
 * @apiQuery {Number} [pageNumber] number ofd page to be sent.
 * @apiQuery {Number} [pageSize] size of page to be sent.
 * @apiQuery {String} [sort] a field to sort users according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Number} length number of received items.
 * @apiSuccess (Success 200) {Number} total number of total items.
 * @apiSuccess (Success 200) {Number} remaining number of remaining items.
 * @apiSuccess (Success 200) {Object} [paginationResult] pagination details for front-end view.
 * @apiSuccess (Success 200) {Object[]} items the received items.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 1,
 *       "total": 4,
 *       "remaining": 3,
 *       "paginationResult": {
 *         "currentPage": 1,
 *         "numberOfPages": 4,
 *         "limit": 1
 *       },
 *       "items": [
 *         {
 *           "_id": "648d9622dab23f0a0192f142",
 *           "name": "Laptop 5",
 *           "img": [
 *             "http://localhost:5000/images/images-1687000610267-320637727.png",
 *             "http://localhost:5000/images/images-1687000610267-234075806.png",
 *             "http://localhost:5000/images/images-1687000610268-234962861.png"
 *           ],
 *           "description": "Laptop Lenovo",
 *           "quantity": 40,
 *           "price": 33000,
 *           "sold": 0,
 *           "rating": 0,
 *           "ratingCount": 0,
 *           "category": "648a103864d65cd14084854b",
 *           "owner": "647e4fc18ef18203fec1442a",
 *           "brand": "641a8df6cc5d346583564c97",
 *           "createdAt": "2023-06-17T11:16:50.336Z",
 *           "updatedAt": "2023-06-17T11:16:50.336Z",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/item/:id Get Item
 * @apiName GetItem
 * @apiGroup Item
 * @apiDescription Used to get item from the database
 * @apiPermission none
 *
 * @apiParam {String} id Item's unique ID in DB.
 *
 * @apiQuery {String} [populate] if true owner, category and brand fields will be populated with full data.
 *
 * @apiSuccess (Success 200) {Object} item the received item details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "item": {
 *         "_id": "648d9622dab23f0a0192f142",
 *         "name": "Laptop 5",
 *         "img": [
 *           "http://localhost:5000/images/images-1687000610267-320637727.png",
 *           "http://localhost:5000/images/images-1687000610267-234075806.png",
 *           "http://localhost:5000/images/images-1687000610268-234962861.png"
 *         ],
 *         "description": "Laptop Lenovo",
 *         "quantity": 40,
 *         "price": 33000,
 *         "sold": 0,
 *         "rating": 0,
 *         "ratingCount": 0,
 *         "category": {
 *           "parent": {
 *             "parentId": "648a103864d65cd140848549",
 *             "parentTitle": "Computers & Accessories"
 *           },
 *           "_id": "648a103864d65cd14084854b",
 *           "title": "Laptops",
 *           "isParent": false,
 *           "createdAt": "2023-06-14T19:08:40.393Z",
 *           "updatedAt": "2023-06-14T19:08:40.393Z",
 *           "slug": "laptops-computers-and-accessories",
 *           "__v": 0
 *         },
 *         "owner": {
 *           "_id": "647e4fc18ef18203fec1442a",
 *           "name": "User 04",
 *           "email": "user04@gmail.com"
 *         },
 *         "brand": {
 *           "_id": "641a8df6cc5d346583564c97",
 *           "name": "Lenovo",
 *           "img": "http://localhost:5000/brands/image-1679461878133-417865377.png",
 *           "createdAt": "2023-03-22T05:11:18.276Z",
 *           "updatedAt": "2023-03-22T05:11:18.276Z",
 *           "__v": 0
 *         },
 *         "createdAt": "2023-06-17T11:16:50.336Z",
 *         "updatedAt": "2023-06-17T11:16:50.336Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/item Create Item
 * @apiName CreateItem
 * @apiGroup Item
 * @apiDescription Used to get item from the database (the body of the request should be sent as form-data and will result in an error response if it doesn't meet the requirements)
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} name name of the item (btw 3-55 and start with a letter).
 * @apiBody {String} description description of the item.
 * @apiBody {String} category category id of the item (must be a valid mongo id for an existing category).
 * @apiBody {String} brand brand id of the item (must be a valid mongo id for an existing brand).
 * @apiBody {Number} price price of the item (must be a positive integer).
 * @apiBody {Number} quantity quantity of the item (must be a positive integer).
 *
 * @apiSuccess (Success 200) {String} itemid the id of the created item.
 * @apiSuccess (Success 200) {String} create if true the item is created successfully.
 * @apiSuccess (Success 200) {Object} item the created item details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "itemid": "648dca319650640ec73667c6",
 *       "create": true,
 *       "item": {
 *         "name": "Samsung M52",
 *         "img": [],
 *         "description": "Mobile Samsung",
 *         "quantity": 30,
 *         "price": 1200,
 *         "sold": 0,
 *         "rating": 0,
 *         "ratingCount": 0,
 *         "category": "64124a5eafaf72e97d7a2dc5",
 *         "owner": "647e4fc28ef18203fec14432",
 *         "brand": "64149519282c2ab9d6f686b9",
 *         "_id": "648dca319650640ec73667c6",
 *         "createdAt": "2023-06-17T14:58:57.947Z",
 *         "updatedAt": "2023-06-17T14:58:57.947Z",
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
 * @api {patch} /api/item/:id Edit Item
 * @apiName EditItem
 * @apiGroup Item
 * @apiDescription Used to edit item in database (the body of the request should be sent as form-data and will result in an error response if it doesn't meet the requirements)
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Item's unique ID in DB.
 *
 * @apiBody {String} name name of the item (btw 3-55 and start with a letter).
 * @apiBody {String} description description of the item.
 * @apiBody {String} category category id of the item (must be a valid mongo id for an existing category).
 * @apiBody {String} brand brand id of the item (must be a valid mongo id for an existing brand).
 * @apiBody {Number} price price of the item (must be a positive integer).
 * @apiBody {Number} quantity quantity of the item (must be a positive integer).
 *
 * @apiSuccess (Success 200) {String} itemid the id of the updated item.
 * @apiSuccess (Success 200) {String} update if true the item is updated successfully.
 * @apiSuccess (Success 200) {Object} item the updated item details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "itemid": "648dca319650640ec73667c6",
 *       "update": true,
 *       "item": {
 *         "_id": "648dca319650640ec73667c6",
 *           "name": "Samsung M52",
 *           "img": [],
 *           "description": "Mobile Samsung",
 *           "quantity": 30,
 *           "price": 7300,
 *           "sold": 0,
 *           "rating": 0,
 *           "ratingCount": 0,
 *           "category": "648a103b64d65cd14084857d",
 *           "owner": "647e4fc28ef18203fec14432",
 *           "brand": "641a7899f33b7ada42dc3523",
 *           "createdAt": "2023-06-17T14:58:57.947Z",
 *           "updatedAt": "2023-06-17T15:08:05.727Z",
 *           "__v": 0
 *       }
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/item/:id Delete Item
 * @apiName DeleteItem
 * @apiGroup Item
 * @apiDescription Used to delete item in database
 * @apiPermission Vendor
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Item's unique ID in DB.
 *
 * @apiSuccess (Success 200) {String} itemid the id of the deleted item.
 * @apiSuccess (Success 200) {String} delete if true the item is deleted successfully.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "itemid": "648dca319650640ec73667c6",
 *       "delete": true
 *     }
 *
 * @apiUse ItemNotFoundError
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
 * @apiDefine ListNotFoundError
 * @apiError ListNotFound The id of the order was not found.
 * @apiErrorExample {json} 404 List Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "List not found."
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
