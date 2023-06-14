import Joi from 'joi';
import smn from 'joi-objectid';

Joi.objectId = smn(Joi);
const joiTitle = Joi.string()
	.min(2)
	.max(255)
	.pattern(/^\p{L}.*$/u)
	.message('title should start with a letter');
const joiId = Joi.objectId();

export default class CategoryValidator {
	static categories(categories) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			sort: Joi.string()
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			main: Joi.string()
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			title: joiTitle,
			parentId: joiId,
			isParent: Joi.string().allow('true', 'false'),
			slug: Joi.string(),
			catArr: Joi.string()
		});
		return Schema.validate(categories, { convert: false, abortEarly: false });
	}

	static addCategory(category) {
		const Schema = Joi.object({
			title: joiTitle.required(),
			parentId: joiId
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static updateCategory(category) {
		const Schema = Joi.object({
			title: joiTitle
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}
}
