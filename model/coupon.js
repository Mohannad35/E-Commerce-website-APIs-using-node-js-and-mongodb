const mongoose = require('mongoose');
const moment = require('moment');

function generateRandomString(length = 16) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minLength: 3,
			maxLength: 255
		},
		validFrom: {
			type: Date,
			default: new Date()
		},
		expireAt: {
			type: Date,
			default: moment().add(30, 'days').format('YYYY-MM-DD')
		},
		vendor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{
		timestamps: true
	}
);

couponSchema.statics.getCoupons = async function (query) {
	let { code, validFrom, expireAt, skip, limit, sort, pageNumber, pageSize } = query;
	if (pageNumber || pageSize) {
		limit = undefined;
		skip = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || '';
	if (sort) sort = sort.split(',').join(' ');
	let coupons;
	if (code) {
		code = new RegExp(code, 'i');
		coupons = await Coupon.find({ code }, {}, { skip, limit, sort }).collation({ locale: 'en' });
	} else if (expireAt)
		coupons = await Coupon.find(
			{ expireAt: { $gte: new Date(expireAt) } },
			{},
			{ skip, limit, sort }
		).collation({ locale: 'en' });
	else if (validFrom)
		coupons = await Coupon.find(
			{ validFrom: { $lte: new Date(validFrom) } },
			{},
			{ skip, limit, sort }
		).collation({ locale: 'en' });
	else coupons = await Coupon.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' });
	const totalCoupons = await Coupon.countDocuments();
	return { pageNumber, pageSize, totalCoupons, coupons };
};

couponSchema.statics.getWorkingCoupons = async function (query) {
	let { skip, limit, sort, pageNumber, pageSize } = query;
	if (pageNumber || pageSize) {
		limit = undefined;
		skip = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || '';
	if (sort) sort = sort.split(',').join(' ');
	const coupons = await Coupon.find(
		{ expireAt: { $gte: new Date() }, validFrom: { $lte: new Date() } },
		{},
		{ skip, limit, sort }
	).collation({ locale: 'en' });
	const totalCoupons = await Coupon.countDocuments();
	return { pageNumber, pageSize, totalCoupons, coupons };
};

couponSchema.statics.getCouponById = async function (id) {
	return await Coupon.findById(id);
};

couponSchema.statics.createCoupon = async function (
	code,
	expireAt = null,
	validFrom = null,
	vendor = null
) {
	let coupon;
	if (!code) {
		let found = true;
		while (found) {
			code = generateRandomString(16);
			coupon = await Coupon.findOne({ code });
			if (!coupon) found = false;
		}
	} else {
		coupon = await Coupon.findOne({ code });
		if (coupon) return { err: true, status: 400, message: 'This coupon already exists' };
	}
	coupon = new Coupon({ code, expireAt, validFrom, vendor });
	return { coupon };
};

couponSchema.statics.editCoupon = async function (id, expireAt = null, validFrom = null) {
	let coupon = await Coupon.findById(id);
	if (!coupon) return { err: true, status: 404, message: 'Coupon not found' };
	if (expireAt) coupon.expireAt = expireAt;
	if (validFrom) coupon.validFrom = validFrom;
	return { coupon };
};

couponSchema.statics.deleteCoupon = async function (id) {
	const coupon = await Coupon.findById(id);
	if (!coupon) return { err: true, status: 404, message: 'Coupon not found' };
	await Coupon.deleteOne({ _id: coupon._id });
	return { coupon };
};

// clean up expired coupons

const Coupon = mongoose.model('Coupon', couponSchema, 'coupon');
module.exports = Coupon;
