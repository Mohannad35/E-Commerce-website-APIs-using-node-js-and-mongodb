import Joi from 'joi';
import smn from 'joi-objectid';

Joi.objectId = smn(Joi);
const joiName = Joi.string()
	.min(3)
	.max(255)
	.pattern(/^[\p{L}].*$/u)
	.message('name should start with a letter');
const joiId = Joi.objectId();

export default class ListValidator {
	static list(category) {
		const Schema = Joi.object({
			name: joiName,
			listId: joiId,
			populate: Joi.string().allow('true', 'false', ''),
			page: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('page should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer')
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static addList(category) {
		const Schema = Joi.object({
			name: joiName.required()
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static listItemId(category) {
		const Schema = Joi.object({
			listId: joiId,
			id: joiId.required()
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}
}
