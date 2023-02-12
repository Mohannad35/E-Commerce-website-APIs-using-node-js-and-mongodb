const Order = require('../model/order');
const Cart = require('../model/cart');
const Item = require('../model/item');
const Validator = require('../middleware/Validator');
const orderDebugger = require('debug')('app:cart');

class OrderController {
	// get order for the logged in user
	static async getOrders(req, res) {
		try {
			orderDebugger(req.headers['user-agent']);
			const pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
			const pageSize = req.query.pageSize ? req.query.pageSize : 10;
			const owner = req.user._id;
			const orders = await Order.find({ owner: owner })
				.populate('owner', '-_id name email phoneNumbers')
				.select('owner status items bill paymentMethod contactPhone address createdAt')
				.skip((pageNumber - 1) * pageSize)
				.limit(pageSize)
				.sort('-createdAt');
			const orderCount = await Order.find().count();
			res.status(200).send({ pageLength: orders.length, totalLength: orderCount, orders });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// make an order
	static async checkout(req, res) {
		try {
			orderDebugger(req.headers['user-agent']);
			const { error } = Validator.validateOrder(req.body);
			if (error) throw new Error(error.details[0].message);
			const cart = await Cart.findOne({ owner: req.user._id });
			if (!cart) return res.status(404).send('No cart found');
			const order = await Order.create({
				owner: req.user._id,
				items: cart.items,
				bill: cart.bill,
				paymentMethod: req.body.paymentMethod ? req.body.paymentMethod : 'cash',
				contactPhone: req.body.contactPhone,
				address: req.body.address,
			});
			cart.items.forEach(
				async item =>
					await Item.updateOne({ _id: item.itemId }, { $inc: { quantity: -item.quantity } })
			);
			await Cart.findByIdAndDelete(cart._id);
			res.status(201).send({ message: 'order made', order });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// cancel an order
	static async cancelOrder(req, res) {
		try {
			orderDebugger(req.headers['user-agent']);
			const { error } = Validator.validateOrderId(req.query);
			if (error) throw new Error(error.details[0].message);
			const order = await Order.findById(req.query.id);
			if (!order) return res.status(404).send('No Order found');
			if (!order.owner.equals(req.user._id)) return res.status(401).send('Authurization Required');
			if (order.status !== 'pickup')
				return res.status(200).send('Order already sent for shipping.');
			order.items.forEach(
				async item =>
					await Item.updateOne({ _id: item.itemId }, { $inc: { quantity: item.quantity } })
			);
			await Order.findByIdAndDelete(req.query.id);
			res.status(200).send({ message: 'order cancelled', order });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// shipping order
	static async confirmOrder(req, res) {
		try {
			orderDebugger(req.headers['user-agent']);
			const { error } = Validator.validateOrderId(req.query);
			if (error) throw new Error(error.details[0].message);
			const order = await Order.findById(req.query.id);
			if (!order) return res.status(404).send('No Order found');
			if (req.user.accountType !== 'admin') return res.status(401).send('Authurization Required');
			if (order.status !== 'pickup')
				return res.status(200).send('Order already sent for shipping.');
			order.status = 'shipping';
			await order.save();
			res.status(200).send({ message: 'order sent for shipping', order });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// order shipped
	static async orderShipped(req, res) {
		try {
			orderDebugger(req.headers['user-agent']);
			const { error } = Validator.validateOrderId(req.query);
			if (error) throw new Error(error.details[0].message);
			const order = await Order.findById(req.query.id);
			if (!order) return res.status(404).send('No Order found');
			if (req.user.accountType !== 'admin') return res.status(401).send('Authurization Required');
			if (order.status === 'pickup')
				return res.status(200).send('Order is not sent for shipping yet.');
			if (order.status === 'shipped') return res.status(200).send('Order is already shipped');
			order.status = 'shipped';
			await order.save();
			res.status(200).send({ message: 'order shipped', order });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}
}

module.exports = OrderController;
