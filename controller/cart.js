const Cart = require('../model/cart');
const Item = require('../model/item');
const Validator = require('../middleware/Validator');
const cartDebugger = require('debug')('app:cart');

class CartController {
	// get all the items in a user cart from the Database and return them as JSON
	static async getCartItems(req, res) {
		try {
			cartDebugger(req.headers['user-agent']);
			const cart = await Cart.findOne({ owner: req.user._id })
				.populate('owner', '-_id name')
				.select('owner items bill');
			if (cart && cart.items.length > 0) res.status(200).send(cart);
			else res.send('cart is empty');
		} catch (error) {
			res.status(400).send(error);
		}
	}

	// add an item to a user cart or create a new cart if the user does not have an existing cart
	static async addCart(req, res) {
		try {
			cartDebugger(req.headers['user-agent']);
			if (req.user.accountType !== 'client') throw new Error('only client can have carts');
			const { error } = Validator.validateCart(req.body);
			if (error) throw new Error(error.details[0].message);
			const { itemId, quantity } = req.body;
			const cart = await Cart.findOne({ owner: req.user._id })
				.populate('owner', '-_id name')
				.select('owner items bill');
			const item = await Item.findOne({ _id: itemId });
			if (!item) return res.status(404).send({ message: 'item not found' });
			// If cart dosn't exist create it
			if (!cart) {
				let newCart = await Cart.create({
					owner: req.user._id,
					items: [{ itemId, name: item.name, quantity, price: item.price }],
					bill: quantity * item.price,
				});
				newCart = await Cart.findById(newCart._id)
					.populate('owner', '-_id name')
					.select('owner items bill');
				return res.status(201).send(newCart);
			}
			// check if product already exists in cart or not
			const itemIndex = cart.items.findIndex(item => item.itemId.equals(itemId));
			if (itemIndex > -1) {
				cart.items[itemIndex].quantity += quantity;
				cart.bill = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
				await cart.save();
				return res.status(200).send(cart);
			} else {
				cart.items.push({ itemId, name: item.name, quantity, price: item.price });
				console.log('bill = ' + cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0));
				cart.bill = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
				await cart.save();
				return res.status(200).send(cart);
			}
		} catch (error) {
			console.log(error);
			res.status(400).send(error.message);
		}
	}

	// delete an item from a user cart
	static async deleteItemInCart(req, res) {
		try {
			cartDebugger(req.headers['user-agent']);
			const { error } = Validator.validateCartId(req.query);
			if (error) throw new Error(error.details[0].message);
			const itemId = req.query.itemId;
			let cart = await Cart.findOne({ owner: req.user._id })
				.populate('owner', 'name')
				.select('owner items bill');
			const itemIndex = cart.items.findIndex(item => item.itemId.equals(itemId));
			if (itemIndex < 0) throw new Error(`item dosn't exist`);
			cart.items.splice(itemIndex, 1);
			cart.bill = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
			await cart.save();
			res.status(200).send(cart);
		} catch (error) {
			res.status(400).send(error.message || error);
		}
	}

	// reduce an item from a user cart
	static async reduceItemInCart(req, res) {
		try {
			const { error: errorId } = Validator.validateCartId(req.query);
			if (errorId) throw new Error(errorId.details[0].message);
			const { error } = Validator.validateQuantity(req.body);
			if (error) throw new Error(error.details[0].message);
			const itemId = req.query.itemId;
			const quantity = req.body.quantity;
			let cart = await Cart.findOne({ owner: req.user._id })
				.populate('owner', 'name')
				.select('owner items bill');
			const itemIndex = cart.items.findIndex(item => item.itemId.equals(itemId));
			if (itemIndex < 0) throw new Error(`item dosn't exist`);
			cart.items[itemIndex].quantity -= quantity;
			if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);
			cart.bill = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
			await cart.save();
			res.status(200).send(cart);
		} catch (error) {
			res.status(400).send(error.message || error);
		}
	}
}

module.exports = CartController;
