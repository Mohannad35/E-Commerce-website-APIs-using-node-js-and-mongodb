import Joi from 'joi';

const joiName = Joi.string()
	.min(2)
	.max(255)
	.pattern(/^[\p{L}].*$/u)
	.message('name should start with a letter');

export default class BrandValidator {
	static addBrand(brand) {
		const Schema = Joi.object({
			name: joiName.required()
		});
		return Schema.validate(brand, { convert: false, abortEarly: false });
	}

	static updateBrand(brand) {
		const Schema = Joi.object({
			name: joiName
		});
		return Schema.validate(brand, { convert: false, abortEarly: false });
	}

	static getBrands(brand) {
		const Schema = Joi.object({
			name: joiName,
			sort: Joi.string()
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			pageNumber: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer')
		});
		return Schema.validate(brand, { convert: false, abortEarly: false });
	}
}
