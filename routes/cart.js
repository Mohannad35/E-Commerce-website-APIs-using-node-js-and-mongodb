const Auth = require('../middleware/auth');
const CartController = require('../controller/cart');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');

// get cart items
router.get('/', Auth, CartController.getCartItems);

// create cart or add items to it
router.post('/:id', Auth, validateObjectId, CartController.addCart);

// reduce item quantity in cart or remove it from cart
router.delete('/:id', Auth, validateObjectId, CartController.reduceItemInCart);

module.exports = router;
