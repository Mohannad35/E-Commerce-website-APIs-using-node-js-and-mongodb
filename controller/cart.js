const Cart = require('../model/cart');
const Item = require('../model/item');
const Validator = require('../middleware/Validator');
const cartDebugger = require('debug')('app:cart');
const _ = require('lodash');

class CartController {
	// get all the items in a user cart from the Database and return them as JSON
	static async getCartItems(req, res) {
		cartDebugger(req.headers['user-agent']);
		let cart = await Cart.findOne({ owner: req.user._id }).select('owner items bill');
		if (!cart || cart.items.length === 0) return res.status(204).send();
		cart = _.set(_.pick(cart, ['_id', 'items', 'bill']), 'owner', req.user.name);
		res.status(200).send({ cartid: cart._id, cart });
	}

	// add an item to a user cart or create a new cart if the user does not have an existing cart
	static async addCart(req, res) {
		cartDebugger(req.headers['user-agent']);
		const err = Validator.validateCart(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const itemId = req.params.id;
		const { quantity } = req.body;
		let cart = await Cart.findOne({ owner: req.user._id }).select('owner items bill');
		const item = await Item.findById(itemId);
		if (!item) return res.status(404).send({ message: 'item not found' });
		if (!cart) cart = await Cart.create({ owner: req.user._id, items: [], bill: 0 });
		const itemIndex = cart.items.findIndex(item => item.itemId.equals(itemId));
		if (itemIndex !== -1) cart.items[itemIndex].quantity += quantity;
		else cart.items.push({ itemId, name: item.name, quantity, price: item.price });
		cart.bill = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
		await cart.save();
		res.status(200).send({ cartid: cart._id, update: true });
	}

	// reduce an item from a user cart or delete it
	static async reduceItemInCart(req, res) {
		cartDebugger(req.headers['user-agent']);
		err = Validator.validateQuantity(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const itemId = req.params.id;
		const quantity = req.body.quantity ? req.body.quantity : -1;
		let cart = await Cart.findOne({ owner: req.user._id }).select('owner items bill');
		const itemIndex = cart.items.findIndex(item => item.itemId.equals(itemId));
		if (itemIndex === -1) return res.status(404).send({ message: `Item dosn't exist in cart` });
		cart.items[itemIndex].quantity -= quantity;
		if (cart.items[itemIndex].quantity <= 0 || quantity === -1) cart.items.splice(itemIndex, 1);
		cart.bill = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
		await cart.save();
		res.status(200).send({ cartid: cart._id, update: true });
	}
}

module.exports = CartController;
