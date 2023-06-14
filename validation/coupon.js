import Joi from 'joi';

export default class CouponValidator {
	static getCoupons(coupon) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			sort: Joi.string()
				.allow('')
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			code: Joi.string().allow(''),
			all: Joi.string().allow(''),
			working: Joi.string().allow(''),
			expireAt: Joi.string().allow(''),
			expireDay: Joi.string().allow('')
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}

	static addCoupon(coupon) {
		const Schema = Joi.object({
			code: Joi.string().allow(''),
			discount: Joi.number().min(0).max(99).required(),
			expireAt: Joi.string().allow(''),
			validFrom: Joi.string().allow('')
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}

	static coupon(coupon) {
		const Schema = Joi.object({
			code: Joi.string()
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}

	static updateCoupon(coupon) {
		const Schema = Joi.object({
			code: Joi.string().allow(''),
			discount: Joi.number().min(0).max(99).allow(''),
			expireAt: Joi.string().allow(''),
			validFrom: Joi.string().allow('')
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}
}
