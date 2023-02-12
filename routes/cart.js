const Auth = require('../middleware/auth');
const CartController = require('../controller/cart');
const router = require('express').Router();

// get cart items
router.get('/', Auth, CartController.getCartItems);

// create cart or add items to it
router.post('/', Auth, CartController.addCart);

// delete item in cart
router.delete('/', Auth, CartController.deleteItemInCart);

// reduce item quantity in cart
router.put('/', Auth, CartController.reduceItemInCart);

module.exports = router;
