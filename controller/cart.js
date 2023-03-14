const Cart = require('../model/cart');
const cartDebugger = require('debug')('app:cart');

class CartController {
	// get all the items in a user cart from the Database and return them as JSON
	static async getCartItems(req, res) {
		cartDebugger(req.headers['user-agent']);
		const { full } = req.query;
		const { _id: owner, name: ownerName } = req.user;
		const cart = await Cart.getCart(owner, full);
		if (!cart || cart.items.length === 0) return res.status(204).send();
		res.status(200).send({ cartid: cart._id, cart });
	}

	// add an item to a user cart or create a new cart if the user does not have an existing cart
	static async addItemToCart(req, res) {
		cartDebugger(req.headers['user-agent']);
		const { _id: owner } = req.user;
		const { id: itemId } = req.params;
		const { quantity } = req.body;
		const { err, status, message, cart } = await Cart.addToCart(owner, itemId, quantity);
		if (err) return res.status(status).send({ error: true, message });
		await cart.save();
		res.status(200).send({ cartid: cart._id, update: true });
	}

	// add an item to a user cart or create a new cart if the user does not have an existing cart
	static async addItemsToCart(req, res) {
		cartDebugger(req.headers['user-agent']);
		const { _id: owner } = req.user;
		const { items } = req.body;
		let err, status, message, cart;
		for (let item of items) {
			({ err, status, message, cart } = await Cart.addToCart(owner, item._id, item.quantity));
			if (err) return res.status(status).send({ error: true, message });
			await cart.save();
		}
		res.status(200).send({ cartid: cart._id, update: true });
	}

	// reduce an item from a user cart or delete it
	static async reduceItemInCart(req, res) {
		cartDebugger(req.headers['user-agent']);
		const { _id: owner } = req.user;
		const { id: itemId } = req.params;
		const { quantity } = req.body;
		const { err, status, message, cart } = await Cart.reduceItemInCart(owner, itemId, quantity);
		if (err) return res.status(status).send({ error: true, message });
		await cart.save();
		res.status(200).send({ cartid: cart._id, update: true });
	}
}

module.exports = CartController;
