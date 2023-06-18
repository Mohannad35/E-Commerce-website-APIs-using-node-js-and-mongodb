import Joi from 'joi';
import smn from 'joi-objectid';

Joi.objectId = smn(Joi);
const joiId = Joi.objectId();

export default class RateValidator {
	static addRate(rate) {
		const Schema = Joi.object({
			itemId: joiId.required(),
			rateValue: Joi.number().min(0).max(5).required(),
			review: Joi.string()
		});
		return Schema.validate(rate, { convert: false, abortEarly: false });
	}

	static editRate(rate) {
		const Schema = Joi.object({
			rateValue: Joi.number().min(0).max(5),
			review: Joi.string()
		}).or('rateValue', 'review');
		return Schema.validate(rate, { convert: false, abortEarly: false });
	}

	static getRates(rate) {
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
			itemId: joiId.allow(''),
			userId: joiId.allow('')
		});
		return Schema.validate(rate, { convert: false, abortEarly: false });
	}
}
