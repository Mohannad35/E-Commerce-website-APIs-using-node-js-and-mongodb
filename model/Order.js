import mongoose from 'mongoose';
import Item from './item.js';
import Cart from './cart.js';

const orderSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		contactPhone: {
			type: String,
			required: true,
			match: /^([\+][2])?[0][1][0125][0-9]{8}$/
		},
		status: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			default: 'pickup',
			enum: {
				values: ['pickup', 'shipping', 'shipped'],
				message: '{VALUE} is not valid. Must be pickup, shipping, or shipped'
			}
		},
		paymentMethod: {
			type: String,
			lowercase: true,
			trim: true,
			required: true,
			default: 'cash',
			enum: {
				values: ['cash', 'credit card'],
				message: '{VALUE} is not valid. Must be cash or credit card'
			}
		},
		address: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 1000
		},
		items: [
			{
				_id: false,
				itemId: {
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
			min: [0, 'Invalid bill']
		}
	},
	{
		timestamps: true
	}
);

orderSchema.statics.getOrders = async function (_id, pageNumber = 1, pageSize = 20, sort = '-_id') {
	return await Order.find(
		{ owner: _id },
		'owner status paymentMethod contactPhone address items bill',
		{
			populate: { path: 'owner', select: 'name email' },
			skip: (pageNumber - 1) * pageSize,
			limit: pageSize,
			sort
		}
	);
};

orderSchema.statics.remainingOrders = async function (
	owner,
	pageNumber = 1,
	pageSize = 20,
	limit = 100
) {
	const count = await Order.countDocuments({ owner }, { skip: pageNumber * pageSize, limit });
	return count <= 100 ? count : '+100';
};

// the next function can be improved with transactions in mongodbbut it's not easy to
// implement on localhost cluster so maybe in the future with online cluster
async function updateItems(cart, order) {
	let abortedItemId = null;
	for (let item of cart.items) {
		const itemInDb = await Item.findById(item.itemId, 'quantity');
		itemInDb.quantity -= item.quantity;
		if (itemInDb.quantity < 0) {
			abortedItemId = itemInDb._id;
			break;
		} else await itemInDb.save();
	}
	if (abortedItemId) {
		for (let item of cart.items) {
			const itemInDB = await Item.findById(item.itemId, 'quantity');
			if (abortedItemId.equals(itemInDB._id)) {
				await Order.deleteOne({ _id: order._id });
				return { isAborted: true, abortedItemName: item.name };
			}
			itemInDB.quantity += item.quantity;
			await itemInDB.save();
		}
	}
	return { isAborted: false };
}

orderSchema.statics.checkout = async function (
	owner,
	paymentMethod = 'cash',
	contactPhone,
	address
) {
	const cart = await Cart.findOne({ owner });
	if (!cart || cart.items.length === 0)
		return { err: true, status: 404, message: 'No items in cart' };
	const { items, bill } = cart;
	const order = new Order({ owner, items, bill, paymentMethod, contactPhone, address });
	const { isAborted, abortedItemName: name } = await updateItems(cart, order);
	if (isAborted)
		return { err: true, status: 400, message: `Not enough quantity of ${name} is available` };
	await Cart.findByIdAndDelete(cart._id);
	return { order };
};

orderSchema.statics.cancelOrder = async function (id, owner) {
	const order = await Order.findById(id, 'owner status items');
	if (!order) return { err: true, status: 404, message: 'No order found' };
	if (!order.owner.equals(owner)) return { err: true, status: 403, message: 'Access denied' };
	if (order.status !== 'pickup')
		return { err: true, status: 406, message: `Cancel denied. Order in ${order.status} state.` };
	order.items.forEach(
		async item => await Item.updateOne({ _id: item.itemId }, { $inc: { quantity: item.quantity } })
	);
	await Order.findByIdAndDelete(id);
	return order;
};

orderSchema.statics.confirmOrder = async function (id) {
	const order = await Order.findById(id, 'status');
	if (!order) return { err: true, status: 404, message: 'No order found' };
	if (order.status !== 'pickup')
		return { err: true, status: 400, message: `Denied. Order in ${order.status} state.` };
	order.status = 'shipping';
	return order;
};

orderSchema.statics.orderShipped = async function (id, owner) {
	const order = await Order.findById(id, 'status');
	if (!order) return { err: true, status: 404, message: 'No order found' };
	if (order.status !== 'shipping')
		return { err: true, status: 400, message: `Denied. Order in ${order.status} state.` };
	order.status = 'shipped';
	return order;
};

const Order = mongoose.model('Order', orderSchema, 'order');
export default Order;
