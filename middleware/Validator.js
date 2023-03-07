const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const passwordComplexity = require('joi-password-complexity');
const moment = require('moment');

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
const JoiConfirmPassword = Joi.any()
	.label('Confirm password')
	.equal(Joi.ref('password'))
	.messages({ 'any.only': `{{#label}} doesn't match` });
const JoiDate = Joi.date()
	.less(moment().subtract(10, 'years').format('YYYY-MM-DD'))
	.message('You must be older than 10 years')
	.greater(moment().subtract(120, 'years').format('YYYY-MM-DD'))
	.message('You must be younger than 120 years');
const joiAccountType = Joi.string().valid('client', 'admin', 'vendor');
const joiDescription = Joi.string().min(3).max(1024);
const joiPrice = Joi.number().positive();
const joiQuantity = Joi.number().integer().positive();

class Validator {
	// user validation
	static getUsers(opts) {
		const Schema = Joi.object({
			skip: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			age: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('age should be a positive integer'),
			maxAge: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('maxAge should be a positive integer'),
			sort: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('sort should only contain letters'),
			accountType: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('accountType should only contain letters'),
			gender: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('gender should only contain letters'),
			name: Joi.string(),
			email: Joi.string()
		});
		return Schema.validate(opts, { convert: false, abortEarly: false });
	}

	static signup(account) {
		console.log(moment().subtract(10, 'years').format('YYYY-MM-DD'));
		const Schema = Joi.object({
			name: joiName.required(),
			email: joiEmail.required(),
			phoneNumber: joiPhoneNumber.required(),
			password: passwordComplexity(complexityOptions, 'Password').required(),
			confirmPassword: JoiConfirmPassword.required(),
			birthday: JoiDate.required(),
			gender: Joi.string().allow('male', 'female').required(),
			city: Joi.string().min(3).max(1024),
			address: Joi.string().min(3).max(1024),
			companyName: Joi.string().min(3).max(1024),
			businessAddress: Joi.string().min(3).max(1024),
			websiteAddress: Joi.string().domain().min(3).max(1024),
			isVendor: Joi.boolean()
		});
		return Schema.validate(account, { abortEarly: false });
	}

	static login(account) {
		const Schema = Joi.object({
			email: joiEmail.required(),
			password: Joi.string().required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static vendorReq(body) {
		const Schema = Joi.object({
			details: Joi.string()
		});
		return Schema.validate(body, { convert: false, abortEarly: false });
	}

	static token(query) {
		const Schema = Joi.object({
			token: Joi.string().required()
		});
		return Schema.validate(query, { convert: false, abortEarly: false });
	}

	static email(body) {
		const Schema = Joi.object({
			email: Joi.string().email().required()
		});
		return Schema.validate(body, { convert: false, abortEarly: false });
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
	static getItems(item) {
		const Schema = Joi.object({
			skip: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			sort: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('sort should only contain letters'),
			categoryId: Joi.objectId(),
			categorySlug: Joi.string(),
			categoryTitle: Joi.string(),
			ownerId: Joi.objectId(),
			ownerName: Joi.string(),
			price: Joi.string()
				.pattern(/^[0-9]+-[0-9]+$/)
				.message('price should be a positive integer'),
			name: Joi.string()
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

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
