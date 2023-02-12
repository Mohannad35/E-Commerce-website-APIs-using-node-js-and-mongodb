const Joi = require('joi');

class Validator {
	// validate a new user account and return the result
	static validateNewAccount(account) {
		const Schema = Joi.object({
			name: Joi.string()
				.min(3)
				.max(255)
				.pattern(/^[A-Za-z]\w+/)
				.required(),
			email: Joi.string().email().required(),
			password: Joi.string()
				.min(8)
				.max(30)
				.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$/)
				.required(),
			repeatedPassword: Joi.string().equal(Joi.ref('password')),
			phoneNumber: Joi.string()
				.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
				.required(),
		});
		return Schema.validate(account);
	}

	static validateLogin(account) {
		const Schema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string(),
		});
		return Schema.validate(account);
	}

	static validateAccountType(account) {
		const Schema = Joi.object({
			id: Joi.objectId().required(),
			type: Joi.string().allow('client', 'admin', 'vendor').required(),
		});
		return Schema.validate(account);
	}

	static validateUserInfo(account) {
		const Schema = Joi.object({
			name: Joi.string()
				.min(3)
				.max(255)
				.pattern(/^[A-Za-z]\w+/),
			email: Joi.string().email(),
		}).or('name', 'email');
		return Schema.validate(account);
	}

	static validatePassword(account) {
		const Schema = Joi.object({
			oldPassword: Joi.string().required(),
			newPassword: Joi.string()
				.min(8)
				.max(30)
				.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$/)
				.required(),
		});
		return Schema.validate(account);
	}

	static validatePhoneNumber(account) {
		const Schema = Joi.object({
			phoneNumber: Joi.string()
				.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
				.required(),
		});
		return Schema.validate(account);
	}

	static validateNewItem(item) {
		const Schema = Joi.object({
			name: Joi.string()
				.min(3)
				.max(255)
				.pattern(/^[A-Za-z][A-Za-z0-9 ]{3,255}$/)
				.required(),
			description: Joi.string().max(1000).required(),
			category: Joi.string().max(255).required(),
			price: Joi.number().positive().precision(2).required(),
			quantity: Joi.number().integer().positive().required(),
		});
		return Schema.validate(item);
	}

	static validateItemId(item) {
		const Schema = Joi.object({
			id: Joi.objectId().required(),
		});
		return Schema.validate(item);
	}

	static validateUpdateItem(item) {
		const Schema = Joi.object({
			name: Joi.string()
				.min(3)
				.max(255)
				.pattern(/^[A-Za-z][A-Za-z0-9 ]{3,255}$/),
			description: Joi.string().alphanum().max(255),
			category: Joi.string().alphanum().max(255),
			price: Joi.number().positive().precision(2),
			quantity: Joi.number().integer().positive(),
		}).or('name', 'description', 'category', 'price', 'quantity');
		return Schema.validate(item);
	}

	static validateCart(cart) {
		const Schema = Joi.object({
			itemId: Joi.objectId().required(),
			quantity: Joi.number().integer().positive().required(),
		});
		return Schema.validate(cart);
	}

	static validateQuantity(cart) {
		const Schema = Joi.object({
			quantity: Joi.number().integer().positive().required(),
		});
		return Schema.validate(cart);
	}

	static validateCartId(cart) {
		const Schema = Joi.object({
			itemId: Joi.objectId().required(),
		});
		return Schema.validate(cart);
	}

	static validateOrderId(order) {
		const Schema = Joi.object({
			id: Joi.objectId().required(),
		});
		return Schema.validate(order);
	}

	static validateOrderStatus(order) {
		const Schema = Joi.object({
			status: Joi.string().allow('pickup', 'shipped').required(),
		});
		return Schema.validate(order);
	}

	static validateOrder(cart) {
		const Schema = Joi.object({
			paymentMethod: Joi.string().allow('cash', 'credit card'),
			contactPhone: Joi.string()
				.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
				.required(),
			address: Joi.string().min(3).max(1000).required(),
		});
		return Schema.validate(cart);
	}
}

module.exports = Validator;
