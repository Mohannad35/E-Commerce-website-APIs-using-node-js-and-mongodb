const Order = require('../model/order');
const Cart = require('../model/cart');
const Item = require('../model/item');
const Validator = require('../middleware/Validator');
const orderDebugger = require('debug')('app:order');
const _ = require('lodash');

class OrderController {
	// get order for the logged in user
	static async getOrders(req, res) {
		orderDebugger(req.headers['user-agent']);
		const pageNum = req.query.pageNumber ? req.query.pageNumber : 1;
		const pageSize = req.query.pageSize ? req.query.pageSize : 10;
		const orders = await Order.find(
			{ owner: req.user._id },
			'owner status paymentMethod contactPhone address items bill',
			{
				populate: { path: 'owner', select: 'name email' },
				skip: (pageNum - 1) * pageSize,
				limit: pageSize,
				sort: '-_id'
			}
		);
		const count = await Order.countDocuments({}, { skip: pageNum * pageSize, limit: 100 });
		res.status(200).send({ pageLength: orders.length, remLength: count, orders });
	}

	// make an order
	static async checkout(req, res) {
		orderDebugger(req.headers['user-agent']);
		const err = Validator.validateOrder(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const cart = await Cart.findOne({ owner: req.user._id });
		if (!cart || cart.items.length === 0)
			return res.status(404).send({ message: 'No items in cart' });
		let order = await Order.create({
			owner: req.user._id,
			items: cart.items,
			bill: cart.bill,
			paymentMethod: req.body.paymentMethod ? req.body.paymentMethod : 'cash',
			contactPhone: req.body.contactPhone,
			address: req.body.address
		});
		// the next code lines can be improved with transactions in mongodbbut it's not easy to
		// implement on localhost cluster so may be in the future with online cluster
		let abortedItemId = null;
		for (let item of cart.items) {
			const itemInDB = await Item.findById(item.itemId, 'quantity');
			itemInDB.quantity -= item.quantity;
			if (itemInDB.quantity < 0) {
				abortedItemId = itemInDB._id;
				break;
			} else await itemInDB.save();
		}
		if (abortedItemId) {
			for (let item of cart.items) {
				const itemInDB = await Item.findById(item.itemId, 'quantity');
				if (abortedItemId.equals(itemInDB._id)) {
					await Order.deleteOne({ _id: order._id });
					return res.status(400).send(`Not enough quantity of ${item.name} is available`);
				}
				itemInDB.quantity += item.quantity;
				await itemInDB.save();
			}
		}
		await Cart.findByIdAndDelete(cart._id);
		res.status(201).send({ orderid: order._id, create: true });
	}

	// cancel an order
	static async cancelOrder(req, res) {
		orderDebugger(req.headers['user-agent']);
		const order = await Order.findById(req.params.id).select('owner status items');
		if (!order) return res.status(404).send({ message: 'No Order found' });
		if (!order.owner.equals(req.user._id))
			return res.status(403).send({ message: 'Access denied' });
		if (order.status !== 'pickup')
			return res.status(406).send({ message: 'Order sent for shipping.' });
		order.items.forEach(
			async item =>
				await Item.updateOne({ _id: item.itemId }, { $inc: { quantity: item.quantity } })
		);
		await Order.findByIdAndDelete(req.params.id);
		res.status(200).send({ orderid: order._id, delete: true });
	}

	// shipping order
	static async confirmOrder(req, res) {
		orderDebugger(req.headers['user-agent']);
		const order = await Order.findById(req.params.id).select('status');
		if (!order) return res.status(404).send({ message: 'No Order found' });
		if (order.status !== 'pickup')
			return res.status(400).send({ message: 'Order sent for shipping.' });
		order.status = 'shipping';
		await order.save();
		res.send({ orderid: order._id, update: true, message: 'order sent for shipping' });
	}

	// order shipped
	static async orderShipped(req, res) {
		orderDebugger(req.headers['user-agent']);
		const order = await Order.findById(req.params.id).select('status');
		if (!order) return res.status(404).send({ message: 'No Order found.' });
		if (order.status === 'pickup')
			return res.status(400).send({ message: 'Order is not sent for shipping yet.' });
		if (order.status === 'shipped')
			return res.status(400).send({ message: 'Order is already shipped.' });
		order.status = 'shipped';
		await order.save();
		res.status(200).send({ orderid: order._id, update: true, message: 'order shipped' });
	}
}

module.exports = OrderController;
