import _ from 'lodash';
import Order from './../model/order.js';

export default class OrderController {
	// get order for the logged in user
	static async getOrders(req, res) {
		const { _id: owner } = req.user;
		const { query } = req;
		const { total, remaining, paginationResult, orders } = await Order.getOrders(req.user, query);
		res.status(200).send({ length: orders.length, total, remaining, paginationResult, orders });
	}

	// make an order (notify the vendors)
	static async checkout(req, res) {
		const { _id: owner } = req.user;
		const { paymentMethod, contactPhone, address, coupon } = req.body;
		const { err, status, message, order } = await Order.checkout(
			owner,
			paymentMethod,
			contactPhone,
			address,
			coupon
		);
		if (err) return res.status(status).send({ error: true, message });
		await order.save();
		res.status(201).send({ order, create: true });
	}

	// cancel an order (notify the vendors)
	static async cancelOrder(req, res) {
		const { _id: owner } = req.user;
		const { id } = req.params;
		const { err, status, message, order } = await Order.cancelOrder(id, owner);
		if (err) return res.status(status).send({ error: true, message });
		res.status(200).send({ delete: true, order });
	}

	// shipping order (API for vendors to confirm shipping)
	static async confirmOrder(req, res) {
		const { id } = req.params;
		const { err, status, message, order } = await Order.confirmOrder(id);
		if (err) return res.status(status).send({ error: true, message });
		await order.save();
		res.send({ order, update: true, message: 'Order sent for shipping' });
	}

	// order shipped (API for vendors or delivery to confirm arrival of order)
	static async orderShipped(req, res) {
		const { id } = req.params;
		const { err, status, message, order } = await Order.orderShipped(id);
		if (err) return res.status(status).send({ error: true, message });
		await order.save();
		res.status(200).send({ order, update: true, message: 'Order shipped' });
	}
}
