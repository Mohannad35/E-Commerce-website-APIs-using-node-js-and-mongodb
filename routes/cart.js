const auth = require('../middleware/auth');
const CartController = require('../controller/cart');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validateReq');
const Validator = require('../middleware/Validator');

// get cart items
router.get('/', [auth], CartController.getCartItems);

// create cart or add items to it
router.post(
	'/:id',
	[auth, validateObjectId, validate('body', Validator.cart)],
	CartController.addItemToCart
);

// create cart or add items to it
router.post('/', [auth, validate('body', Validator.cartItems)], CartController.addItemsToCart);

// reduce item quantity in cart or remove it from cart
router.delete(
	'/:id',
	[auth, validateObjectId, validate('body', Validator.quantity)],
	CartController.reduceItemInCart
);

module.exports = router;
