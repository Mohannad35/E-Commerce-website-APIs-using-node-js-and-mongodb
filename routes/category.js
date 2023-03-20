import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import CategoryController from '../controller/category.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// fetch all Categories
router.get('/', [validate('query', Validator.categories)], CategoryController.categories);

// fetch sub Categories
router.get('/sub/:id', [validateObjectId], CategoryController.subCategories);

// fetch a Category
router.get('/:id', [validateObjectId], CategoryController.category);

// create a Category
router.post(
	'/',
	[auth, isAdmin, validate('body', Validator.addCategory)],
	CategoryController.addCategory
);

// update a Category
router.patch(
	'/:id',
	[auth, isAdmin, validateObjectId, validate('body', Validator.updateCategory)],
	CategoryController.updateCategory
);

// delete a Category
router.delete('/:id', [auth, isAdmin, validateObjectId], CategoryController.deleteCategory);

export default router;
