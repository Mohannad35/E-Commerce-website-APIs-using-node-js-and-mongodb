import mongoose from 'mongoose';
import moment from 'moment';
import User from './user.js';
import Cart from './cart.js';

const couponSchema = new mongoose.Schema(
	{
		code: { type: String, required: true, unique: true, trim: true, minLength: 3, maxLength: 255 },
		discount: {
			type: Number,
			required: true,
			default: 0,
			min: 1,
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

couponSchema.statics.getCoupons = async function (user, query) {
	let { code, skip, limit, sort, pageNumber, pageSize } = query;

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

	let coupons = [],
		total = 0;
	if (user.accountType === 'vendor') {
		coupons = await Coupon.find({ code, vendor: user._id }, {}, { skip, limit, sort }).collation({
			locale: 'en'
		});
		total = await Coupon.countDocuments({ code, vendor: user._id }).collation({ locale: 'en' });
	} else if (user.accountType === 'admin') {
		coupons = await Coupon.find({ code }, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Coupon.countDocuments({ code }).collation({ locale: 'en' });
	}

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

couponSchema.statics.applyCoupon = async function (owner, code) {
	const cart = await Cart.findOne({ owner }).populate('items.item');
	if (!cart || cart.items.length === 0)
		return { err: true, status: 400, message: 'Cart is empty!' };

	const coupon = await Coupon.findOne({ code });
	if (!coupon || coupon.expireAt < new Date() || coupon.validFrom > new Date())
		return { err: true, status: 400, message: 'Invalid coupon.' };

	if (cart.coupon.includes(code))
		return { err: true, status: 400, message: 'Coupon already applied.' };

	if (coupon.vendor) {
		for (let item of cart.items) {
			if (coupon.vendor.equals(item.item.owner)) {
				item.priceAfter = item.priceAfter
					? parseFloat(item.priceAfter) * (1 - coupon.discount / 100)
					: parseFloat(item.price) * (1 - coupon.discount / 100);
			}
		}
	} else {
		for (let item of cart.items) {
			item.priceAfter = item.priceAfter
				? parseFloat(item.priceAfter) * (1 - coupon.discount / 100)
				: parseFloat(item.price) * (1 - coupon.discount / 100);
		}
	}

	cart.bill = cart.items.reduce(
		(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
		0
	);
	cart.billBefore = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

	cart.coupon.push(code);
	await cart.save();

	return { cart: await Cart.findOne({ owner }) };
};

couponSchema.statics.cancelCoupon = async function (owner, code) {
	const cart = await Cart.findOne({ owner }).populate('items.item');
	if (!cart || cart.items.length === 0)
		return { err: true, status: 400, message: 'Cart is empty!' };

	const coupon = await Coupon.findOne({ code });
	if (!coupon || coupon.expireAt < new Date() || coupon.validFrom > new Date())
		return { err: true, status: 400, message: 'Invalid coupon.' };

	if (!cart.coupon.includes(code))
		return { err: true, status: 400, message: 'Coupon is not applied.' };

	cart.coupon = cart.coupon.filter(value => value !== code);

	if (cart.coupon.length <= 0) {
		for (let item of cart.items) item.priceAfter = undefined;
	} else {
		if (coupon.vendor) {
			for (let item of cart.items) {
				if (coupon.vendor.equals(item.item.owner)) {
					item.priceAfter = parseFloat(item.priceAfter) / (1 - coupon.discount / 100);
				}
			}
		} else {
			for (let item of cart.items) {
				item.priceAfter = parseFloat(item.priceAfter) / (1 - coupon.discount / 100);
			}
		}
	}

	cart.bill = cart.items.reduce(
		(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
		0
	);
	cart.billBefore = cart.items.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

	await cart.save();

	return { cart: await Cart.findOne({ owner }) };
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
