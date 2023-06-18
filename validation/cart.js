import Joi from 'joi';
import smn from 'joi-objectid';

Joi.objectId = smn(Joi);
const joiQuantity = Joi.string()
	.pattern(/^[0-9]+$/)
	.message('Quantity should be a positive integer');

export default class CartValidator {
	static getCart(cart) {
		const Schema = Joi.object({
			full: Joi.string().allow('', 'true', 'false')
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}

	static cart(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity.required()
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}

	static cartItems(items) {
		const Schema = Joi.object({
			items: Joi.array()
				.items(
					Joi.object({
						_id: Joi.objectId().required(),
						quantity: Joi.number().integer().positive().required()
					})
				)
				.required()
		});
		return Schema.validate(items, { convert: false, abortEarly: false });
	}

	static quantity(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}
}
