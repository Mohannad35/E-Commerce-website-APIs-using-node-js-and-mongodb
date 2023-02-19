const Joi = require('joi');
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
	.pattern(/^[A-Za-z][A-Za-z0-9 ]{2,255}$/)
	.message('name should start with a letter and minimum length of 3');
const joiEmail = Joi.string().email().message('{:[.]} is not a valid email address');
const joiPhoneNumber = Joi.string()
	.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
	.message('{:[.]} is not a valid phone number');
const joiAccountType = Joi.string().valid('client', 'admin', 'vendor');
const joiDescription = Joi.string().min(3).max(1024);
const joiCategory = Joi.string().min(3).max(255);
const joiPrice = Joi.number().positive();
const joiQuantity = Joi.number().integer().positive();

class Validator {
	// user validation
	static validateNewAccount(account) {
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
		const { error } = Schema.validate(account, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validateLogin(account) {
		const Schema = Joi.object({
			email: joiEmail.required(),
			password: Joi.string().required()
		});
		const { error } = Schema.validate(account, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validateAccountType(account) {
		const Schema = Joi.object({
			type: joiAccountType.required()
		});
		const { error } = Schema.validate(account, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validateUserInfo(account) {
		const Schema = Joi.object({
			name: joiName,
			email: joiEmail
		}).or('name', 'email');
		const { error } = Schema.validate(account, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validatePassword(account) {
		const Schema = Joi.object({
			oldPassword: Joi.string().required(),
			newPassword: passwordComplexity(complexityOptions, 'Password').required()
		});
		const { error } = Schema.validate(account, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validatePhoneNumber(account) {
		const Schema = Joi.object({
			phoneNumber: joiPhoneNumber.required()
		});
		const { error } = Schema.validate(account, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	// item validation
	static validateNewItem(item) {
		const Schema = Joi.object({
			name: joiName.required(),
			description: joiDescription.required(),
			category: joiCategory.required(),
			price: joiPrice.required(),
			quantity: joiQuantity.required()
		});
		const { error } = Schema.validate(item, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validateUpdateItem(item) {
		const Schema = Joi.object({
			name: joiName,
			description: joiDescription,
			category: joiCategory,
			price: joiPrice,
			quantity: joiQuantity
		}).or('name', 'description', 'category', 'price', 'quantity');
		const { error } = Schema.validate(item, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	// cart validation
	static validateCart(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity.required()
		});
		const { error } = Schema.validate(cart, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	static validateQuantity(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity
		});
		const { error } = Schema.validate(cart, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}

	// order validation
	static validateOrder(order) {
		const Schema = Joi.object({
			paymentMethod: Joi.string().allow('cash', 'credit card'),
			contactPhone: joiPhoneNumber.required(),
			address: Joi.string().min(3).max(1024).required()
		});
		const { error } = Schema.validate(order, { convert: false });
		if (error) return error.details[0].message;
		return false;
	}
}

module.exports = Validator;
