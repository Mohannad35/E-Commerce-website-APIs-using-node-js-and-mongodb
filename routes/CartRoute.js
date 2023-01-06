const express = require("express");
const Auth = require("../middleware/auth");
const CartController = require("../controller/CartController");

const router = new express.Router();

// get cart items
router.get("/cart", Auth, CartController.getCartItems);

// create cart or add items to it
router.post("/cart", Auth, CartController.addCart);

// delete item in cart
router.delete("/cart", Auth, CartController.deleteItemInCart);

module.exports = router;
