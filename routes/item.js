const auth = require('../middleware/auth');
const isVendor = require('../middleware/vendor');
const ItemController = require('../controller/item');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');

// fetch all items
router.get('/', ItemController.getAllItems);

// fetch an item
router.get('/:id', validateObjectId, ItemController.getOneItem);

// create an item
router.post('/', auth, isVendor, ItemController.addItem);

// update an item
router.patch('/:id', auth, isVendor, validateObjectId, ItemController.updateItem);

// delete item
router.delete('/:id', auth, isVendor, validateObjectId, ItemController.deleteItem);

module.exports = router;
