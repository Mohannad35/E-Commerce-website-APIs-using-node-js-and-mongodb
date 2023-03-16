import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import ItemController from '../controller/item.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// fetch all items
router.get('/', ItemController.items);

// fetch an item
router.get('/:id', [validateObjectId], ItemController.getOneItem);

// create an item
router.post('/', [auth, isVendor, validate('body', Validator.addItem)], ItemController.addItem);

// update an item
router.patch(
	'/:id',
	[auth, isVendor, validateObjectId, validate('body', Validator.updateItem)],
	ItemController.updateItem
);

// delete item
router.delete('/:id', [auth, isVendor, validateObjectId], ItemController.deleteItem);

export default router;
