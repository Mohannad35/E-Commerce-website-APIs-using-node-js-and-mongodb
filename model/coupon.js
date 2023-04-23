import mongoose from 'mongoose';
import moment from 'moment';
import User from './user.js';

const couponSchema = new mongoose.Schema(
	{
		code: { type: String, required: true, unique: true, trim: true, minLength: 3, maxLength: 255 },
		discount: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			max: 99,
			get: v => (Math.round(v * 100) / 100).toFixed(2),
			set: v => (Math.round(v * 100) / 100).toFixed(2)
		},
		validFrom: { type: Date, default: new Date() },
		expireAt: { type: Date, default: moment().add(30, 'days').format('YYYY-MM-DD') },
		vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
	},
	{
		timestamps: true
	}
);

couponSchema.statics.getCoupons = async function (query) {
	let { code, all, working, expireAt, expireDay, skip, limit, sort, pageNumber, pageSize } = query;
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
	code = code ? new RegExp(code, 'i') : /.*/;
	expireDay = expireDay && parseInt(expireDay);
	expireAt = expireDay
		? moment().add(expireDay, 'days').format('YYYY-MM-DD')
		: expireAt || moment();
	const coupons = all
		? await Coupon.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' })
		: working
		? await Coupon.find(
				{ code, expireAt: { $gte: new Date(expireAt) }, validFrom: { $lte: new Date() } },
				{},
				{ skip, limit, sort }
		  ).collation({ locale: 'en' })
		: await Coupon.find(
				{ code, expireAt: { $gte: new Date(expireAt) } },
				{},
				{ skip, limit, sort }
		  ).collation({ locale: 'en' });
	const total = all
		? await Coupon.countDocuments().collation({ locale: 'en' })
		: working
		? await Coupon.countDocuments({
				code,
				expireAt: { $gte: new Date(expireAt) },
				validFrom: { $lte: new Date() }
		  }).collation({ locale: 'en' })
		: await Coupon.countDocuments({ code, expireAt: { $gte: new Date(expireAt) } }).collation({
				locale: 'en'
		  });
	const numberOfPages = Math.ceil(total / pageSize);
	return {
		total,
		paginationResult: {
			currentPage: parseInt(pageNumber),
			numberOfPages,
			limit: parseInt(pageSize)
		},
		coupons
	};
};

couponSchema.statics.getCouponById = async function (id, populate) {
	if (populate) return await Coupon.findById(id).populate('vendor', 'name email');
	return await Coupon.findById(id);
};

couponSchema.statics.createCoupon = async function (code, discount, vendor, expireAt, validFrom) {
	let coupon;
	validFrom = validFrom === '' ? undefined : validFrom;
	if (!code || code === '') {
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
	coupon = new Coupon({ code, discount, expireAt, validFrom, vendor });
	return { coupon };
};

couponSchema.statics.editCoupon = async function (id, owner, code, discount, expireAt, validFrom) {
	let coupon = await Coupon.findById(id);
	if (!coupon) return { err: true, status: 404, message: 'Coupon not found' };
	const user = await User.findById(owner);
	if (user.accountType !== 'admin')
		if (!(coupon.vendor && coupon.vendor.equals(owner)))
			return { err: true, status: 403, message: 'Access denied' };
	if (expireAt) coupon.expireAt = expireAt;
	if (validFrom) coupon.validFrom = validFrom;
	if (code) {
		const exist = await Coupon.findOne({ code });
		if (exist) return { err: true, status: 400, message: 'Code already used' };
		coupon.code = code;
	}
	if (discount) coupon.discount = discount;
	return { coupon };
};

couponSchema.statics.deleteCoupon = async function (id, owner) {
	const coupon = await Coupon.findById(id);
	if (!coupon) return { err: true, status: 404, message: 'Coupon not found' };
	const user = await User.findById(owner);
	if (user.accountType !== 'admin')
		if (!(coupon.vendor && coupon.vendor.equals(owner)))
			return { err: true, status: 403, message: 'Access denied' };

	await Coupon.deleteOne({ _id: coupon._id });
	return { coupon };
};

// clean up expired coupons

const Coupon = mongoose.model('Coupon', couponSchema, 'coupon');
export default Coupon;

function generateRandomString(length = 16) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
