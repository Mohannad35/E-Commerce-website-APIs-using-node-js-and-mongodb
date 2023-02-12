const Auth = require('../middleware/auth');
const ItemController = require('../controller/item');
const router = require('express').Router();

// fetch all items
router.get('/', ItemController.getAllItems);

// fetch an item
router.get('/:id', ItemController.getOneItem);

// create an item
router.post('/', Auth, ItemController.addItem);

// update an item
router.patch('/:id', Auth, ItemController.updateItem);

// delete item (need to check if the user has admin permissions or he's the owner of the item)
router.delete('/:id', Auth, ItemController.deleteItem);

module.exports = router;
