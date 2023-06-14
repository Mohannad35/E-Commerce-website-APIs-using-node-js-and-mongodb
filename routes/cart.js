import { Router } from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import CartValidator from './../validation/cart.js';
import CartController from '../controller/cart.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// get cart items
router.get('/', [auth, validate('query', CartValidator.getCart)], CartController.getCartItems);

// create cart or add items to it
router.post(
	'/:id',
	[auth, validateObjectId, validate('body', CartValidator.cart)],
	CartController.addItemToCart
);

// create cart or add items to it
router.post('/', [auth, validate('body', CartValidator.cartItems)], CartController.addItemsToCart);

// reduce item quantity in cart or remove it from cart
router.delete(
	'/:id',
	[auth, validateObjectId, validate('body', CartValidator.quantity)],
	CartController.deleteItemFromCart
);

router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', CartValidator.quantity)],
	CartController.editItemInCart
);

export default router;
