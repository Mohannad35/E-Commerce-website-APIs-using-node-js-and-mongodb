import _ from 'lodash';
import Order from './../model/order.js';

export default class OrderController {
	// get order for the logged in user
	static async getOrders(req, res) {
		orderDebugger(req.headers['user-agent']);
		const { _id: owner } = req.user;
		const { pageNumber, pageSize, sortBy } = req.query;
		const orders = await Order.getOrders(owner, pageNumber, pageSize, sortBy);
		const remainingOrders = await Order.remainingOrders(owner, pageNumber, pageSize, 100);
		res.status(200).send({ pageLength: orders.length, remainingOrders, orders });
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
	static async editOrderStatus(req, res) {
		const { _id: owner } = req.user;
		const { id } = req.params;
		const { status } = req.body;
		const { err, resStatus, message, order } = await Order.editOrderStatus(id, owner, status);
		if (err) return res.status(resStatus).send({ error: true, message });
		res.status(200).send({ update: true, order });
	}
}
