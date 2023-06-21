import Joi from 'joi';
import smn from 'joi-objectid';

Joi.objectId = smn(Joi);
const joiName = Joi.string()
	.min(3)
	.max(255)
	.pattern(/^[\p{L}].*$/u)
	.message('name should start with a letter');
const joiId = Joi.objectId();
const joiDescription = Joi.string().min(3).max(1024);
const joiPrice = Joi.string()
	.pattern(/^[0-9.]+$/)
	.message('Price should be a positive number');
const joiQuantity = Joi.string()
	.pattern(/^[0-9]+$/)
	.message('Quantity should be a positive integer');

export default class ItemValidator {
	static getItems(item) {
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
			category: Joi.string().allow(''),
			owner: Joi.string().allow(''),
			brand: Joi.string().allow(''),
			from: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('from should be a positive integer'),
			to: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('to should be a positive integer'),
			name: Joi.string().allow('')
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	static addItem(item) {
		const Schema = Joi.object({
			name: joiName.required(),
			description: joiDescription.required(),
			category: joiId.required(),
			price: joiPrice.required(),
			quantity: joiQuantity.required(),
			brand: joiId
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	static updateItem(item) {
		const Schema = Joi.object({
			name: joiName,
			description: joiDescription,
			category: joiId,
			brand: joiId,
			price: joiPrice,
			quantity: joiQuantity,
			deleteImages: Joi.any(),
			images: Joi.any()
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}
}
