import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import BrandController from '../controller/brand.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// fetch all Brands
router.get('/', BrandController.brands);

// fetch a Brand
router.get('/:id', [validateObjectId], BrandController.brand);

// create a Brand
router.post('/', [auth, isAdmin, validate('body', Validator.addBrand)], BrandController.addBrand);

// update a Brand
router.patch(
	'/:id',
	[auth, isAdmin, validateObjectId, validate('body', Validator.updateBrand)],
	BrandController.updateBrand
);

// delete a Brand
router.delete('/:id', [auth, isAdmin, validateObjectId], BrandController.deleteBrand);

export default router;
