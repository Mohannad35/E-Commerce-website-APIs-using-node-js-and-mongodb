import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import ListController from '../controller/list.js';
import validateObjectId from '../middleware/validateObjectId.js';
import ListValidator from '../validation/list.js';
const router = Router();

// fetch all Lists
router.get('/', [auth], ListController.lists);

// fetch a list
router.get('/li', [auth, validate('query', ListValidator.list)], ListController.list);

// create a list
router.post('/', [auth, validate('body', ListValidator.list)], ListController.addList);

// update a list name
router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', ListValidator.list)],
	ListController.updateList
);

// add item to list
router.post(
	'/items',
	[auth, validate('body', ListValidator.listItemId)],
	ListController.addItemToList
);

// delete a list item
router.delete(
	'/items',
	[auth, validate('body', ListValidator.listItemId)],
	ListController.removeFromList
);

// delete a list
router.delete('/:id', [auth, validateObjectId], ListController.deleteList);

export default router;

// api documentation
/**
 * @api {get} /api/list Get All Lists
 * @apiName GetAllLists
 * @apiGroup List
 * @apiDescription Used to get all lists
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiQuery {Number} [pageNumber] number ofd page to be sent.
 * @apiQuery {Number} [pageSize] size of page to be sent.
 *
 * @apiSuccess (Success 200) {Number} pageLength number of received lists.
 * @apiSuccess (Success 200) {Number} remainingLists number of remaining lists.
 * @apiSuccess (Success 200) {Object[]} lists the received lists.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "pageLength": 1,
 *       "remainingLists": 0,
 *       "lists": [
 *         {
 *           "_id": "648d990cdab23f0a0192f1f9",
 *           "name": "wishlist",
 *           "userid": "647e4fc18ef18203fec14428",
 *           "items": [
 *             "648d966ddab23f0a0192f152",
 *             "648d98bcdab23f0a0192f19d"
 *           ],
 *           "createdAt": "2023-06-17T11:29:16.189Z",
 *           "updatedAt": "2023-06-17T11:29:17.400Z",
 *           "slug": "wishlist-647e4fc18ef18203fec14428",
 *           "__v": 2
 *         }
 *       ]
 *     }
 *
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/list/li Get List
 * @apiName GetList
 * @apiGroup List
 * @apiDescription Used to get a list
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiQuery {String} name name of the list to be sent.
 * @apiQuery {String} [listId] id of the list to be sent.
 * @apiQuery {Number} [page] number of page to be sent.
 * @apiQuery {Number} [pageSize] size of page to be sent.
 *
 * @apiSuccess (Success 200) {Number} length number of received items.
 * @apiSuccess (Success 200) {Number} total number of total items in list.
 * @apiSuccess (Success 200) {Number} remaining number of remaining items in list.
 * @apiSuccess (Success 200) {Object[]} items the received items.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 2,
 *       "total": 2,
 *       "remaining": 0,
 *       "items": [
 *         {
 *           "_id": "648d966ddab23f0a0192f152",
 *           "name": "Mobile 5",
 *           "img": [
 *             "http://localhost:5000/images/images-1687000685398-194677317.png",
 *             "http://localhost:5000/images/images-1687000685399-930084692.png",
 *             "http://localhost:5000/images/images-1687000685441-449606022.png"
 *           ],
 *           "description": "Mobile Samsung",
 *           "quantity": 29,
 *           "price": 8600,
 *           "sold": 0,
 *           "rating": 0,
 *           "ratingCount": 0,
 *           "category": "648a103764d65cd14084853d",
 *           "owner": "647e4fc18ef18203fec1442a",
 *           "brand": "641a8807dbb9e2bc99433e75",
 *           "createdAt": "2023-06-17T11:18:05.447Z",
 *           "updatedAt": "2023-06-17T12:11:31.312Z",
 *           "__v": 0
 *         },
 *         {
 *           "_id": "648d98bcdab23f0a0192f19d",
 *           "name": "Mobile 5",
 *           "img": [
 *             "http://localhost:5000/images/images-1687001276801-846569544.png",
 *             "http://localhost:5000/images/images-1687001276803-694899459.png",
 *             "http://localhost:5000/images/images-1687001276804-499173175.png"
 *           ],
 *           "description": "Futuristic Mobile phone",
 *           "quantity": 29,
 *           "price": 9200,
 *           "sold": 0,
 *           "rating": 0,
 *           "ratingCount": 0,
 *           "category": "648a103764d65cd14084853d",
 *           "owner": "647e4fc28ef18203fec14432",
 *           "brand": "641a8807dbb9e2bc99433e75",
 *           "createdAt": "2023-06-17T11:27:56.810Z",
 *           "updatedAt": "2023-06-17T12:11:31.312Z",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse ListNotFoundError
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/list Create List
 * @apiName CreateList
 * @apiGroup List
 * @apiDescription Used to add a list
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} name name of the list (must be a string start with a letter and must be unique for each user).
 * @apiExample {json} Request Body Example:
 *     {
 *       "name": "wishList"
 *     }
 *
 * @apiSuccess (Success 200) {String} listId id of the created list.
 * @apiSuccess (Success 200) {Boolean} create if true the list is created successfully.
 * @apiSuccess (Success 200) {Object} list the received list.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "create": true,
 *       "list": {
 *         "name": "wishList",
 *         "userid": "647e4fc18ef18203fec14428",
 *         "items": [],
 *         "_id": "648dbbf22cff379b82c7effb",
 *         "createdAt": "2023-06-17T13:58:10.691Z",
 *         "updatedAt": "2023-06-17T13:58:10.691Z",
 *         "slug": "wishList-647e4fc18ef18203fec14428",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiError ListAlreadyExist The user has a list of the same name.
 * @apiErrorExample {json} 400 List Already Exist Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "list already exists."
 *     }
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {patch} /api/list/:id Update List
 * @apiName UpdateList
 * @apiGroup List
 * @apiDescription Used to update a list name
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id List's unique ID in DB.
 *
 * @apiBody {String} name name of the list (must be a string start with a letter and must be unique for each user).
 * @apiExample {json} Request Body Example:
 *     {
 *       "name": "saved"
 *     }
 *
 * @apiSuccess (Success 200) {String} listId id of the created list.
 * @apiSuccess (Success 200) {Boolean} update if true the list is updated successfully.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "update": true
 *     }
 *
 * @apiError ListAlreadyExist The user has a list of the same name.
 * @apiErrorExample {json} 400 List Already Exist Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "list already exists."
 *     }
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/list/items Add Item To List
 * @apiName AddItemToList
 * @apiGroup List
 * @apiDescription Used to add item to list
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} id id of the item to be added (must be valid mongo id).
 * @apiBody {String} [listId] id of the list (must be valid mongo id. If not sent the default will be wishlist).
 * @apiExample {json} Request Body Example:
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "id": "648d9622dab23f0a0192f142"
 *     }
 *
 * @apiSuccess (Success 200) {String} listId id of the list.
 * @apiSuccess (Success 200) {Boolean} add if true the item is added successfully.
 * @apiSuccess (Success 200) {Object} list list details after the item is added.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "add": true,
 *       "list": {
 *         "_id": "648dbbf22cff379b82c7effb",
 *         "name": "saved",
 *         "userid": "647e4fc18ef18203fec14428",
 *         "items": [
 *           "648d9622dab23f0a0192f142"
 *         ],
 *         "createdAt": "2023-06-17T13:58:10.691Z",
 *         "updatedAt": "2023-06-17T14:14:37.256Z",
 *         "slug": "saved-647e4fc18ef18203fec14428",
 *         "__v": 1
 *       }
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse ListNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/list/items Delete Item From List
 * @apiName DeleteItemFromList
 * @apiGroup List
 * @apiDescription Used to delete item from list
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiBody {String} id id of the item to be added (must be valid mongo id).
 * @apiBody {String} [listId] id of the list (must be valid mongo id. If not sent the default will be wishlist).
 * @apiExample {json} Request Body Example:
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "id": "648d9622dab23f0a0192f142"
 *     }
 *
 * @apiSuccess (Success 200) {String} listId id of the list.
 * @apiSuccess (Success 200) {Boolean} add if true the item is added successfully.
 * @apiSuccess (Success 200) {Object} list list details after the item is added.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "delete": true,
 *       "list": {
 *         "_id": "648dbbf22cff379b82c7effb",
 *         "name": "saved",
 *         "userid": "647e4fc18ef18203fec14428",
 *         "items": [],
 *         "createdAt": "2023-06-17T13:58:10.691Z",
 *         "updatedAt": "2023-06-17T14:18:53.928Z",
 *         "slug": "saved-647e4fc18ef18203fec14428",
 *         "__v": 2
 *       }
 *     }
 *
 * @apiUse ItemNotFoundError
 * @apiUse ListNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/list/:id Delete List
 * @apiName DeleteList
 * @apiGroup List
 * @apiDescription Used to delete list
 *
 * @apiPermission Client
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id List's unique ID in DB.
 *
 * @apiSuccess (Success 200) {String} listId id of the list.
 * @apiSuccess (Success 200) {Boolean} add if true the item is added successfully.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "listId": "648dbbf22cff379b82c7effb",
 *       "delete": true
 *     }
 *
 * @apiUse ListNotFoundError
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
 * @apiError ListNotFound The id of the list was not found.
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
