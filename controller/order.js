import _ from 'lodash';
import Order from './../model/order.js';

export default class OrderController {
	// get order for the logged in user
	static async getOrders(req, res) {
		const { _id: owner } = req.user;
		const { pageNumber, pageSize, sortBy } = req.query;
		const orders = await Order.getOrders(owner, pageNumber, pageSize, sortBy);
		const remainingOrders = await Order.remainingOrders(owner, pageNumber, pageSize, 100);
		res.status(200).send({ pageLength: orders.length, remainingOrders, orders });
	}

	// make an order
	static async checkout(req, res) {
		const { _id: owner, name } = req.user;
		const { paymentMethod, contactPhone, address } = req.body;
		const { err, status, message, order } = await Order.checkout(
			owner,
			paymentMethod,
			contactPhone,
			address
		);
		if (err) return res.status(status).send({ error: true, message });
		await order.save();
		res.status(201).send({ orderid: order._id, create: true });
	}

	// cancel an order
	static async cancelOrder(req, res) {
		const { _id: owner } = req.user;
		const { id } = req.params;
		const { err, status, message, order } = await Order.cancelOrder(id, owner);
		if (err) return res.status(status).send({ error: true, message });
		res.status(200).send({ orderid: order._id, delete: true });
	}

	// shipping order
	static async confirmOrder(req, res) {
		const { id } = req.params;
		const { err, status, message, order } = await Order.confirmOrder(id);
		if (err) return res.status(status).send({ error: true, message });
		await order.save();
		res.send({ orderid: order._id, update: true, message: 'Order sent for shipping' });
	}

	// order shipped
	static async orderShipped(req, res) {
		const { id } = req.params;
		const { err, status, message, order } = await Order.orderShipped(id);
		if (err) return res.status(status).send({ error: true, message });
		await order.save();
		res.status(200).send({ orderid: order._id, update: true, message: 'Order shipped' });
	}
}
