import { Router } from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import CartController from '../controller/cart.js';
import validateObjectId from '../middleware/validateObjectId.js';
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

export default router;
