const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const passwordComplexity = require('joi-password-complexity');

const complexityOptions = {
	min: 8,
	max: 30,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 3
};
const joiName = Joi.string()
	.min(3)
	.max(255)
	.pattern(/^[A-Za-z].*$/)
	.message('name should start with a letter');
const joiTitle = Joi.string()
	.min(3)
	.max(255)
	.pattern(/^[A-Za-z].*$/)
	.message('title should start with a letter');
const joiId = Joi.objectId();
const joiEmail = Joi.string().email().message('{:[.]} is not a valid email address');
const joiPhoneNumber = Joi.string()
	.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
	.message('{:[.]} is not a valid phone number');
const joiAccountType = Joi.string().valid('client', 'admin', 'vendor');
const joiDescription = Joi.string().min(3).max(1024);
const joiPrice = Joi.number().positive();
const joiQuantity = Joi.number().integer().positive();

class Validator {
	// user validation
	static getUsers(opts) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			sortBy: Joi.string()
				.pattern(/^[A-Za-z][A-Za-z]{2,55}$/)
				.message('sortBy should only contain letters')
		});
		return Schema.validate(opts, { convert: false, abortEarly: false });
	}

	static signup(account) {
		const Schema = Joi.object({
			name: joiName.required(),
			email: joiEmail.required(),
			phoneNumber: joiPhoneNumber.required(),
			password: passwordComplexity(complexityOptions, 'Password').required(),
			confirmPassword: Joi.any()
				.label('Confirm password')
				.equal(Joi.ref('password'))
				.messages({ 'any.only': `{{#label}} doesn't match` })
				.required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static login(account) {
		const Schema = Joi.object({
			email: joiEmail.required(),
			password: Joi.string().required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static accountType(account) {
		const Schema = Joi.object({
			type: joiAccountType.required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static userInfo(account) {
		const Schema = Joi.object({
			name: joiName,
			email: joiEmail
		})
			.or('name', 'email')
			.label('Body');
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static password(account) {
		const Schema = Joi.object({
			oldPassword: Joi.string().required(),
			newPassword: passwordComplexity(complexityOptions, 'Password').required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static phoneNumber(account) {
		const Schema = Joi.object({
			phoneNumber: joiPhoneNumber.required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	// item validation
	static addItem(item) {
		const Schema = Joi.object({
			name: joiName.required(),
			description: joiDescription.required(),
			categoryId: joiId.required(),
			price: joiPrice.required(),
			quantity: joiQuantity.required()
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	static updateItem(item) {
		const Schema = Joi.object({
			name: joiName,
			description: joiDescription,
			categoryId: joiId,
			price: joiPrice,
			quantity: joiQuantity
		}).or('name', 'description', 'category', 'price', 'quantity');
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	// cart validation
	static cart(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity.required()
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}

	static quantity(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}

	// order validation
	static order(order) {
		const Schema = Joi.object({
			paymentMethod: Joi.string().allow('cash', 'credit card'),
			contactPhone: joiPhoneNumber.required(),
			address: Joi.string().min(3).max(1024).required()
		});
		return Schema.validate(order, { convert: false, abortEarly: false });
	}

	// category validations
	static addCategory(category) {
		const Schema = Joi.object({
			title: joiTitle.required(),
			parentId: joiId
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static updateCategory(category) {
		const Schema = Joi.object({
			title: joiTitle,
			parentId: joiId
		}).or('title', 'parentId');
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	// list validations
	static list(category) {
		const Schema = Joi.object({
			name: joiName.required()
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static listItemId(category) {
		const Schema = Joi.object({
			id: joiId.required()
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}
}

module.exports = Validator;
