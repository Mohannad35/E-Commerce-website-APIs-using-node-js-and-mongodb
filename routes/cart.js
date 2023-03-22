const { Router } = require('express');
const auth = require('../middleware/auth.js');
const validate = require('../middleware/validateReq.js');
const Validator = require('../middleware/validator.js');
const CartController = require('../controller/cart.js');
const validateObjectId = require('../middleware/validateObjectId.js');
const router = Router();

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
