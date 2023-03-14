const mongoose = require('mongoose');
const Item = require('./item');

const cartSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		items: [
			{
				_id: false,
				item: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Item',
					required: true
				},
				name: {
					type: String,
					required: true,
					trim: true,
					minLength: 3,
					maxLength: 255,
					match: /^[\p{L}].*$/u
				},
				quantity: {
					type: Number,
					required: true,
					min: [0, 'Invalid quantity']
				},
				price: {
					type: Number,
					required: true,
					min: [0, 'Invalid price']
				}
			}
		],
		bill: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			get: v => (Math.round(v * 100) / 100).toFixed(2),
			set: v => (Math.round(v * 100) / 100).toFixed(2)
		}
	},
	{
		timestamps: true
	}
);

cartSchema.statics.getCart = async function (owner, full = false) {
	if (full)
		return await Cart.findOne({ owner }, 'owner items bill', {
			populate: { path: 'owner', select: 'name' },
			populate: { path: 'items.item', select: '_id img description category owner' }
		});
	return await Cart.findOne({ owner }, 'owner items bill', {
		populate: { path: 'owner', select: 'name' }
	});
};

cartSchema.statics.createCart = async function (owner) {
	return new Cart({ owner, items: [], bill: 0 });
};

cartSchema.statics.addToCart = async function (owner, itemId, quantity) {
	let cart = await Cart.getCart(owner);
	if (!cart) cart = await Cart.createCart(owner);
	const item = await Item.findById(itemId);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	const { name, price } = item;
	const itemIndex = cart.items.findIndex(obj => obj.item.equals(itemId));
	if (itemIndex !== -1) cart.items[itemIndex].quantity += quantity;
	else cart.items.push({ item: itemId, name, quantity, price });
	cart.bill = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
	return { cart };
};

cartSchema.statics.reduceItemInCart = async function (owner, itemId, quantity = -1) {
	let cart = await Cart.findOne({ owner }, 'owner items bill');
	if (!cart) return { err: true, status: 404, message: 'Cart not found' };
	const itemIndex = cart.items.findIndex(obj => obj.item.equals(itemId));
	if (itemIndex === -1) return { err: true, status: 404, message: `Item dosn't exist in cart` };
	cart.items[itemIndex].quantity -= quantity;
	if (cart.items[itemIndex].quantity <= 0 || quantity === -1) cart.items.splice(itemIndex, 1);
	cart.bill = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
	return { cart };
};

const Cart = mongoose.model('Cart', cartSchema, 'cart');
module.exports = Cart;
