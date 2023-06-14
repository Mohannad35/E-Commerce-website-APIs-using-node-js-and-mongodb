import Joi from 'joi';

const joiPhoneNumber = Joi.string()
	.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
	.message('{:[.]} is not a valid phone number');

export default class OrderValidator {
	static order(order) {
		const Schema = Joi.object({
			paymentMethod: Joi.string().allow('cash', 'credit card'),
			contactPhone: joiPhoneNumber.required(),
			address: Joi.string().min(3).max(1024).required(),
			coupon: Joi.string()
		});
		return Schema.validate(order, { convert: false, abortEarly: false });
	}

	static orders(order) {
		const Schema = Joi.object({
			code: Joi.string().allow(''),
			sort: Joi.string()
				.allow('')
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			pageNumber: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			all: Joi.string()
				.allow('', 'true', 'false')
				.message('all should only be true or false')
		});
		return Schema.validate(order, { convert: false, abortEarly: false });
	}
}
