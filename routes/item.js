const auth = require('../middleware/auth');
const isVendor = require('../middleware/vendor');
const ItemController = require('../controller/item');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validateReq');
const Validator = require('../middleware/Validator');

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

module.exports = router;
