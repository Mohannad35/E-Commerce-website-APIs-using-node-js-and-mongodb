import multer from 'multer';
import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import BrandValidator from '../validation/brand.js';
import BrandController from '../controller/brand.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();
const storage = multer.diskStorage({
	destination: 'public/brands',
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
	}
});
const upload = multer({ storage });

// fetch all Brands
router.get('/', [validate('query', BrandValidator.getBrands)], BrandController.brands);

// fetch a Brand
router.get('/:id', [validateObjectId], BrandController.brand);

// create a Brand
router.post(
	'/',
	[upload.single('image'), auth, isAdmin, validate('body', BrandValidator.addBrand)],
	BrandController.addBrand
);

// update a Brand
router.patch(
	'/:id',
	[
		upload.single('image'),
		auth,
		isAdmin,
		validateObjectId,
		validate('body', BrandValidator.updateBrand)
	],
	BrandController.updateBrand
);

// delete a Brand
router.delete('/:id', [auth, isAdmin, validateObjectId], BrandController.deleteBrand);

export default router;

// api documentation
/**
 * @api {get} /api/brand Get All Brands
 * @apiName GetAllBrands
 * @apiGroup Brand
 * @apiDescription Used to get all brands in the database
 * @apiPermission none
 *
 * @apiQuery {String} [name] brand name (btw 3-55 and should start with a letter).
 * @apiQuery {Number} [pageNumber] number of page to be sent.
 * @apiQuery {Number} [pageSize] size of page to be sent.
 * @apiQuery {String} [sort] a field to sort users according to it if more than one sent (separated by a comma ,) will take first one as primary sorting field others as secondary in case of primary field nondeterministic. also - means descending order.
 *
 * @apiSuccess (Success 200) {Number} length number of received brands.
 * @apiSuccess (Success 200) {Number} total number of total brands.
 * @apiSuccess (Success 200) {Number} remaining number of remaining brands.
 * @apiSuccess (Success 200) {Object} [paginationResult] pagination details for front-end view.
 * @apiSuccess (Success 200) {Object[]} brands the received brands.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "length": 2,
 *       "total": 26,
 *       "remaining": 24,
 *       "paginationResult": {
 *         "currentPage": 1,
 *         "numberOfPages": 13,
 *         "limit": 2
 *       },
 *       "brands": [
 *         {
 *           "_id": "641a7899f33b7ada42dc3523",
 *           "name": "adidas",
 *           "img": "http://localhost:5000/brands/image-1679485893017-71614017.png",
 *           "createdAt": "2023-03-22T03:40:09.745Z",
 *           "updatedAt": "2023-03-22T11:51:57.546Z",
 *           "__v": 0
 *         },
 *         {
 *           "_id": "641a8c9cdbb9e2bc99433e92",
 *           "name": "AMD",
 *           "img": "http://localhost:5000/brands/image-1679461532563-858206390.png",
 *           "createdAt": "2023-03-22T05:05:32.708Z",
 *           "updatedAt": "2023-03-22T05:05:32.708Z",
 *           "__v": 0
 *         }
 *       ]
 *     }
 *
 * @apiUse InternalServerError
 */

/**
 * @api {get} /api/brand/:id Get All Brands
 * @apiName GetAllBrands
 * @apiGroup Brand
 * @apiDescription Used to get all brands in the database
 * @apiPermission none
 *
 * @apiParam {String} id Brand unique ID in DB.
 *
 * @apiSuccess (Success 200) {Object} brand the received brand details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "brand": {
 *         "_id": "641a7899f33b7ada42dc3523",
 *         "name": "adidas",
 *         "img": "http://localhost:5000/brands/image-1679485893017-71614017.png",
 *         "createdAt": "2023-03-22T03:40:09.745Z",
 *         "updatedAt": "2023-03-22T11:51:57.546Z",
 *         "__v": 0
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse BrandNotFoundError
 * @apiUse InternalServerError
 */

/**
 * @api {post} /api/brand Add Brand
 * @apiName AddBrand
 * @apiGroup Brand
 * @apiDescription Used to add brand in the database
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiBody {File} [image] image of the brand as in form-data.
 * @apiBody {String} name name of the brand (btw 3-55 and start with a letter).
 * @apiExample {json} Request Body Example:
 *     {
 *       "name": "test brand"
 *     }
 *
 * @apiSuccess (Success 200) {String} create if true the brand is created successfully.
 * @apiSuccess (Success 200) {Object} brand the created brand details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "create": true,
 *       "brand": {
 *         "name": "test brand",
 *         "img": "http://localhost:5000/brands/image-1687113916559-249087680.png",
 *         "_id": "648f50bcad7a802604177712",
 *         "createdAt": "2023-06-18T18:45:16.688Z",
 *         "updatedAt": "2023-06-18T18:45:16.688Z",
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
 * @api {patch} /api/brand/:id Edit Brand
 * @apiName EditBrand
 * @apiGroup Brand
 * @apiDescription Used to edit brand in the database.
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Brand unique ID in DB.
 *
 * @apiBody {File} [image] image of the brand as in form-data.
 * @apiBody {String} [name] name of the brand (btw 3-55 and start with a letter).
 * @apiExample {json} Request Body Example:
 *     {
 *       "name": "test brand 2"
 *     }
 *
 * @apiSuccess (Success 200) {String} create if true the brand is edited successfully.
 * @apiSuccess (Success 200) {Object} brand the edited brand details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "update": true,
 *       "brand": {
 *         "_id": "648f50bcad7a802604177712",
 *         "name": "test brand 2",
 *         "img": "http://localhost:5000/brands/image-1687113916559-249087680.png",
 *         "createdAt": "2023-06-18T18:45:16.688Z",
 *         "updatedAt": "2023-06-18T18:51:56.528Z",
 *         "__v": 1
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse BrandNotFoundError
 * @apiUse UserForbidden
 * @apiUse UserUnauthorized
 * @apiUse UserAuthorizationBadRequest
 * @apiUse InternalServerError
 */

/**
 * @api {delete} /api/brand/:id Delete Brand
 * @apiName DeleteBrand
 * @apiGroup Brand
 * @apiDescription Used to delete brand in the database
 * @apiPermission Admin
 * @apiUse AuthorizationHeader
 *
 * @apiParam {String} id Brand unique ID in DB.
 *
 * @apiSuccess (Success 200) {String} brandid the Id of the brand.
 * @apiSuccess (Success 200) {String} delete if true the brand is deleted successfully.
 * @apiSuccess (Success 200) {Object} brand the deleted brand details.
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "brandid": "648f50bcad7a802604177712",
 *       "delete": true,
 *       "brand": {
 *         "_id": "648f50bcad7a802604177712",
 *         "name": "test brand 2",
 *         "img": "http://localhost:5000/brands/image-1687113916559-249087680.png",
 *         "createdAt": "2023-06-18T18:45:16.688Z",
 *         "updatedAt": "2023-06-18T18:51:56.528Z",
 *         "__v": 1
 *       }
 *     }
 *
 * @apiUse BadIdError
 * @apiUse BrandNotFoundError
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
 * @apiDefine BrandNotFoundError
 * @apiError BrandNotFound The id or code of the brand was not found.
 * @apiErrorExample {json} 404 Brand Not Found Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Brand not found."
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
