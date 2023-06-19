import mongoose from 'mongoose';
import Item from './item.js';
import Coupon from './coupon.js';

const cartSchema = new mongoose.Schema(
	{
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		coupon: [{ type: String, minLength: 3, maxLength: 1000 }],
		items: [
			{
				_id: false,
				item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
				name: {
					type: String,
					required: true,
					trim: true,
					minLength: 3,
					maxLength: 255,
					match: /^[\p{L}].*$/u
				},
				quantity: { type: Number, required: true, min: [0, 'Invalid quantity'] },
				price: { type: Number, required: true, min: [0, 'Invalid price'] },
				priceAfter: { type: Number, min: [0, 'Invalid price'] },
				img: [{ type: String, trim: true }],
				category: { type: String },
				brand: { type: String },
				rating: { type: String }
			}
		],
		bill: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			get: v => (Math.round(v * 100) / 100).toFixed(2),
			set: v => (Math.round(v * 100) / 100).toFixed(2)
		},
		billBefore: {
			type: Number,
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

cartSchema.statics.getCart = async function (owner, full = 'false') {
	if (full === 'true')
		return await Cart.findOne({ owner })
			.populate('owner', 'name')
			.populate('items.item', '_id img description category owner');
	return await Cart.findOne({ owner }).populate('owner', 'name');
};

cartSchema.statics.createCart = async function (owner) {
	return new Cart({ owner, items: [], bill: 0 });
};

cartSchema.statics.addToCart = async function (owner, itemId, Quantity) {
	const quantity = parseInt(Quantity);
	let cart = await Cart.getCart(owner);
	if (!cart) cart = await Cart.createCart(owner);
	const item = await Item.getItemById(itemId, true);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	const { name, price, img, category, brand, rating } = item;
	const itemIndex = cart.items.findIndex(obj => obj.item.equals(itemId));

	if (itemIndex !== -1) {
		cart.items[itemIndex].quantity += quantity;
	} else {
		let priceAfter;
		if (cart.coupon.length > 0)
			for (let cop of cart.coupon) {
				const coupon = await Coupon.findOne({ code: cop });
				if (coupon.vendor) {
					if (coupon.vendor.equals(item.owner)) {
						priceAfter =
							(priceAfter ? priceAfter : parseFloat(price)) * (1 - coupon.discount / 100);
					}
				} else {
					priceAfter = (priceAfter ? priceAfter : parseFloat(price)) * (1 - coupon.discount / 100);
				}
			}
		cart.items.push({
			item: itemId,
			name,
			quantity,
			price,
			priceAfter,
			img,
			category: category.title,
			brand: brand && brand.name,
			rating
		});
	}

	cart.bill = cart.items.reduce(
		(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
		0
	);
	cart.billBefore = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

	return { cart };
};

cartSchema.statics.reduceItemInCart = async function (owner, itemId, quantity = -1) {
	let cart = await Cart.findOne({ owner }, 'owner items bill');
	if (!cart) return { err: true, status: 404, message: 'Cart not found' };

	const itemIndex = cart.items.findIndex(obj => obj.item.equals(itemId));
	if (itemIndex === -1) return { err: true, status: 404, message: `Item doesn't exist in cart` };

	cart.items[itemIndex].quantity -= quantity;
	if (cart.items[itemIndex].quantity <= 0 || quantity === -1) cart.items.splice(itemIndex, 1);

	cart.bill = cart.items.reduce(
		(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
		0
	);
	cart.billBefore = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

	return { cart };
};

cartSchema.statics.editItemInCart = async function (owner, itemId, Quantity) {
	const quantity = parseInt(Quantity);

	let cart = await Cart.findOne({ owner }, 'owner items bill');
	if (!cart) return { err: true, status: 404, message: 'Cart not found' };

	const itemIndex = cart.items.findIndex(obj => obj.item.equals(itemId));
	if (itemIndex === -1) return { err: true, status: 404, message: `Item doesn't exist in cart` };

	cart.items[itemIndex].quantity = quantity;

	if (cart.items[itemIndex].quantity <= 0 || quantity === -1) cart.items.splice(itemIndex, 1);

	cart.bill = cart.items.reduce(
		(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
		0
	);
	cart.billBefore = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

	return { cart };
};

cartSchema.statics.deleteItemFromCart = async function (owner, itemId) {
	let cart = await Cart.findOne({ owner }, 'owner items bill');
	if (!cart) return { err: true, status: 404, message: 'Cart not found' };

	const itemIndex = cart.items.findIndex(obj => obj.item.equals(itemId));
	if (itemIndex === -1) return { err: true, status: 404, message: `Item doesn't exist in cart` };
	cart.items.splice(itemIndex, 1);

	cart.bill = cart.items.reduce(
		(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
		0
	);
	cart.billBefore = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

	return { cart };
};

const Cart = mongoose.model('Cart', cartSchema, 'cart');
export default Cart;
