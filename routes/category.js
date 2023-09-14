import multer from 'multer';
import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import CategoryValidator from '../validation/category.js';
import CategoryController from '../controller/category.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { azureStorage } from '../start/azure-storage.js';

const router = Router();

const upload = multer({ storage: azureStorage });

// fetch all Categories
router.get('/', [validate('query', CategoryValidator.categories)], CategoryController.categories);

// fetch sub Categories
router.get('/sub/:id', [validateObjectId], CategoryController.subCategories);

// fetch a Category
router.get('/:id', CategoryController.category);

// create a Category
router.post(
	'/',
	[upload.single('image'), auth, isAdmin, validate('body', CategoryValidator.addCategory)],
	CategoryController.addCategory
);

// update a Category
router.patch(
	'/:id',
	[
		upload.single('image'),
		auth,
		isAdmin,
		validateObjectId,
		validate('body', CategoryValidator.updateCategory)
	],
	CategoryController.updateCategory
);

// delete a Category
router.delete('/:id', [auth, isAdmin, validateObjectId], CategoryController.deleteCategory);

export default router;

// api documentation
/**
 * @api {get} /api/category Get All Categories
 * @apiName GetAllCategories
 * @apiGroup Category
 * @apiDescription Used to get all categories in the database
 * @apiPermission none
 *
 * @apiQuery {String} [title] brand title (btw 3-55 and should start with a letter).
 * @apiQuery {String} [main] if true main categories will be sent.
 * @apiQuery {String} [parentId] id of a category to get it's children.
 * @apiQuery {String} [isParent] if true all parent categories will be sent.
 * @apiQuery {String} [slug] slug to search for a category.
 * @apiQuery {String} [catArr] if true an array of category with it's children will be sent.
 * @apiQuery {Number} [pageNumber] number of page to be sent.
 * @apiQuery {Number} [pageSize] size of page to be sent.
 * @apiQuery {String} [sort] a field to sort users according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Number} length number of received categories.
 * @apiSuccess (Success 200) {Number} total number of total categories.
 * @apiSuccess (Success 200) {Number} remaining number of remaining categories.
 * @apiSuccess (Success 200) {Object} [paginationResult] pagination details for front-end view.
 * @apiSuccess (Success 200) {Object[]} categories the received categories.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 2,
 *       "total": 97,
 *       "remaining": 95,
 *       "paginationResult": {
 *         "currentPage": 1,
 *         "numberOfPages": 49,
 *         "limit": 2
 *       },
 *       "categories": [
 *         {
 *           "parent": {
 *             "parentId": "648a103b64d65cd14084857d",
 *             "parentTitle": "Fashion"
 *           },
 *           "_id": "648a103c64d65cd140848591",
 *           "title": "Accessories",
 *           "isParent": false,
 *           "createdAt": "2023-06-14T19:08:44.663Z",
 *           "updatedAt": "2023-06-14T19:08:44.663Z",
 *           "slug": "accessories-fashion",
 *           "__v": 0
 *         },
 *         {
 *           "parent": {
 *             "parentId": "648a104164d65cd1408485e3",
 *             "parentTitle": "Toys, Games & baby"
 *           },
 *           "_id": "648a104264d65cd1408485f7",
 *           "title": "Action Figures",
 *           "isParent": false,
 *           "createdAt": "2023-06-14T19:08:50.847Z",
 *           "updatedAt": "2023-06-14T19:08:50.847Z",
 *           "slug": "action-figures-toys-games-and-baby",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/category/sub/:id Get Sub Categories
 * @apiName GetSubCategories
 * @apiGroup Category
 * @apiDescription Used to get sub categories of a parent category.
 * @apiPermission none
 *
 * @apiParam {String} id Category unique ID in DB.
 *
 * @apiSuccess (Success 200) {Number} length number of received categories.
 * @apiSuccess (Success 200) {Number} total number of total categories.
 * @apiSuccess (Success 200) {Object[]} categories the received categories.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 2,
 *       "total": 2,
 *       "categories": [
 *         {
 *           "parent": {
 *             "parentId": "648a103b64d65cd140848577",
 *             "parentTitle": "Electronics"
 *           },
 *           "_id": "648a103b64d65cd140848579",
 *           "title": "Cameras",
 *           "isParent": false,
 *           "createdAt": "2023-06-14T19:08:43.201Z",
 *           "updatedAt": "2023-06-14T19:08:43.201Z",
 *           "slug": "cameras-electronics",
 *           "__v": 0
 *         },
 *         {
 *           "parent": {
 *             "parentId": "648a103b64d65cd140848577",
 *             "parentTitle": "Electronics"
 *           },
 *           "_id": "648a103b64d65cd14084857b",
 *           "title": "TVS",
 *           "isParent": false,
 *           "createdAt": "2023-06-14T19:08:43.325Z",
 *           "updatedAt": "2023-06-14T19:08:43.325Z",
 *           "slug": "tvs-electronics",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse BadIdError
 * @apiUse CategoryNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/category/:id Get Category
 * @apiName GetCategory
 * @apiGroup Category
 * @apiDescription Used to get a category.
 * @apiPermission none
 *
 * @apiParam {String} id Category unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} category the received category.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "category": {
 *         "_id": "648a103b64d65cd140848577",
 *         "title": "Electronics",
 *         "isParent": true,
 *         "createdAt": "2023-06-14T19:08:43.081Z",
 *         "updatedAt": "2023-06-14T19:08:43.081Z",
 *         "slug": "electronics",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse CategoryNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/category Add Category
 * @apiName AddCategory
 * @apiGroup Category
 * @apiDescription Used to add a new category.
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiBody {File} [image] image of the category as in form-data.
 * @apiBody {String} title title of the category (btw 3-55 and start with a letter).
 * @apiExample {json} Request Body Example:
 *     {
 *       "title": "test category"
 *     }
 *
 * @apiSuccess (Success 200) {String} create if true the brand is created successfully.
 * @apiSuccess (Success 200) {Object} category the received category.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "create": true,
 *       "category": {
 *         "title": "test category",
 *         "isParent": false,
 *         "_id": "648f6c312001640a5cb08a73",
 *         "createdAt": "2023-06-18T20:42:25.977Z",
 *         "updatedAt": "2023-06-18T20:42:25.977Z",
 *         "slug": "test-category",
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
 * @api {patch} /api/category/:id Update Category
 * @apiName UpdateCategory
 * @apiGroup Category
 * @apiDescription Used to update a category.
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Category unique ID in DB.
 *
 * @apiBody {File} [image] image of the category as in form-data.
 * @apiBody {String} [title] title of the category (btw 3-55 and start with a letter).
 * @apiExample {json} Request Body Example:
 *     {
 *       "title": "test category 2"
 *     }
 *
 * @apiSuccess (Success 200) {String} update if true the brand is updated successfully.
 * @apiSuccess (Success 200) {Object} category the received category.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "category": {
 *         "title": "test category 2",
 *         "isParent": false,
 *         "_id": "648f6c312001640a5cb08a73",
 *         "createdAt": "2023-06-18T20:42:25.977Z",
 *         "updatedAt": "2023-06-18T20:45:06.279Z",
 *         "slug": "test-category-2",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse CategoryNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/category/:id Delete Category
 * @apiName DeleteCategory
 * @apiGroup Category
 * @apiDescription Used to delete a category.
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Category unique ID in DB.
 *
 * @apiSuccess (Success 200) {String} categoryid id of the deleted category.
 * @apiSuccess (Success 200) {String} delete if true the brand is deleted successfully.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "categoryid": "648f6c312001640a5cb08a73",
 *       "delete": true
 *     }
 *
 * @apiUse CategoryNotFoundError
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
 * @apiDefine CategoryNotFoundError
 * @apiError CategoryNotFound The id or code of the category was not found.
 * @apiErrorExample {json} 404 Category Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Category not found."
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
