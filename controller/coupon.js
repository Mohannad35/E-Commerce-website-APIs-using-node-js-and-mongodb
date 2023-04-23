import _ from 'lodash';
import Coupon from '../model/coupon.js';

export default class CouponController {
	// get all items from database and return them as JSON objects
	static async coupons(req, res) {
		const { query } = req;
		const { total, paginationResult, coupons } = await Coupon.getCoupons(query);
		res.send({ length: coupons.length, total, paginationResult, coupons });
	}

	// get item by id from database and return it as JSON object
	static async coupon(req, res) {
		const coupon = await Coupon.getCouponById(req.params.id);
		if (!coupon) return res.status(404).send({ message: 'Category not found' });
		res.status(200).send({ coupon });
	}

	// add new item to Database
	static async addCoupon(req, res) {
		let { _id: vendor } = req.user;
		vendor = req.user.accountType === 'admin' ? undefined : vendor;
		const { code, discount, expireAt, validFrom } = req.body;
		const { err, status, message, coupon } = await Coupon.createCoupon(
			code,
			discount,
			vendor,
			expireAt,
			validFrom
		);
		if (err) return res.status(status).send({ error: true, message });
		await coupon.save();
		res.status(201).send({ create: true, coupon });
	}

	static async updateCoupon(req, res) {
		const { _id } = req.user;
		const { id } = req.params;
		const { code, discount, expireAt, validFrom } = req.body;
		const { err, status, message, coupon } = await Coupon.editCoupon(
			id,
			_id,
			code,
			discount,
			expireAt,
			validFrom
		);
		if (err) return res.status(status).send({ error: true, message });
		await coupon.save();
		res.status(200).send({ update: true, coupon });
	}

	static async deleteCoupon(req, res) {
		const { _id } = req.user;
		const { id } = req.params;
		const { err, status, message, coupon } = await Coupon.deleteCoupon(id, _id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ delete: true, coupon });
	}
}
