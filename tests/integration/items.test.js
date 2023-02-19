const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Item = require('../../model/item');
const User = require('../../model/user');

let server;
let name, email, password, accountType, phoneNumber;
let owner, itemName, description, category, price, quantity;
async function getUser() {
	return await User.create({ name, email, password, accountType, phoneNumbers: [{ phoneNumber }] });
}
async function getItem(owner) {
	return await Item.create({
		owner: owner._id,
		name: itemName,
		description,
		category,
		price,
		quantity
	});
}
async function getToken(email, password) {
	const { headers } = await request(server).post('/user/login').send({ email, password });
	return headers['x-auth-token'];
}

describe('/item', () => {
	beforeEach(async () => {
		server = require('../../index');
		itemName = 'item';
		description = 'description';
		category = 'category';
		price = 100;
		quantity = 10;
		name = 'John';
		email = 'John@example.com';
		password = '12345678';
		accountType = 'client';
		phoneNumber = '01234567890';
	});
	afterEach(async () => {
		server.close();
		await Item.deleteMany({});
		await User.deleteMany({});
	});

	describe('GET /', () => {
		it('should return all items', async () => {
			accountType = 'vendor';
			const vendor = await getUser();
			const item1 = await getItem(vendor._id);
			const item2 = await getItem(vendor._id);
			const res = await request(server).get('/item');
			expect(res.status).toBe(200);
			expect(res.body.items).toHaveLength(2);
			expect(res.body.items[0]).toMatchObject(
				_.pick(item1, ['name', 'description', 'category', 'price', 'quantity'])
			);
			expect(res.body.items[0]).toHaveProperty('_id', item1._id.toString());
			expect(res.body.items[0].owner).toHaveProperty('name', vendor.name);
			expect(res.body.items[0].owner).toHaveProperty('_id', vendor._id.toString());
			expect(res.body.items[1]).toMatchObject(
				_.pick(item2, ['name', 'description', 'category', 'price', 'quantity'])
			);
			expect(res.body.items[1]).toHaveProperty('_id', item2._id.toString());
			expect(res.body.items[1].owner).toHaveProperty('name', vendor.name);
			expect(res.body.items[1].owner).toHaveProperty('_id', vendor._id.toString());
		});
	});

	describe('GET /:id', () => {
		it('should return an item if valid id is passed', async () => {
			accountType = 'vendor';
			const vendor = await getUser();
			const item1 = await getItem(vendor._id);
			const res = await request(server).get('/item/' + item1._id.toString());
			expect(res.status).toBe(200);
			expect(res.body.item).toMatchObject(
				_.pick(item1, ['name', 'description', 'category', 'price', 'quantity'])
			);
			expect(res.body.item).toHaveProperty('_id', item1._id.toString());
			expect(res.body.item.owner).toHaveProperty('name', vendor.name);
			expect(res.body.item.owner).toHaveProperty('_id', vendor._id.toString());
		});
		it('should return 400 error if item id is invalid', async () => {
			const res = await request(server).get('/item/' + 1); // invalid id
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/^invalid id/i));
		});
		it(`should return 404 error if there is no item with the passed ID`, async () => {
			const res = await request(server).get('/item/' + new mongoose.Types.ObjectId()); // invalid id
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/not found/i));
		});
	});

	describe('POST /', () => {
		async function exec() {
			return await request(server)
				.post('/item')
				.set('Authorization', 'Bearer ' + token)
				.send(newItem);
		}
		let vendor, token, newItem;
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			token = await getToken(vendor.email, '12345678');
			newItem = {
				name: 'new item',
				description: 'description',
				category: 'category',
				price: 100,
				quantity: 10
			};
		});

		it('should add an item to db if valid input is passed', async () => {
			newItem.name = 'item name';
			await exec();
			const itemInDB = await Item.findOne({ name: newItem.name });
			expect(itemInDB).toMatchObject(newItem);
		});
		it('should return item if valid input is passed', async () => {
			const res = await exec();
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty('create', true);
			expect(res.body).toHaveProperty('itemid');
			expect(res.body.item).toMatchObject(newItem);
		});
		it('should return 400 error if name is too short', async () => {
			newItem.name = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if name is too long', async () => {
			newItem.name = new Array(257).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it(`should return 400 error if name doesn't start with a letter`, async () => {
			newItem.name = '#item';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if description is too short', async () => {
			newItem.description = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if description is too long', async () => {
			newItem.description = new Array(1026).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if category is too short', async () => {
			newItem.category = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if category is too long', async () => {
			newItem.category = new Array(257).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if price is negative number', async () => {
			newItem.price = -1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if quantity is negative number', async () => {
			newItem.quantity = -1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if quantity is float', async () => {
			newItem.quantity = 1.1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
	});

	describe('PATCH /:id', () => {
		async function exec() {
			return await request(server)
				.patch('/item/' + itemId)
				.set('Authorization', 'Bearer ' + token)
				.send(updates);
		}
		let vendor, token, item, updates, itemId;
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			token = await getToken(vendor.email, '12345678');
			item = await getItem(vendor._id);
			itemId = item._id.toString();
			updates = {
				name: 'new name',
				description: 'new description',
				category: 'new category',
				price: 20,
				quantity: 5
			};
		});

		it('should update in db if valid updates are passed', async () => {
			await exec();
			const itemInDB = await Item.findOne({ name: updates.name, category: updates.category });
			expect(itemInDB).toMatchObject(updates);
		});
		it('should return 400 error if name is too short', async () => {
			updates.name = 'a';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if name is too long', async () => {
			updates.name = new Array(257).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if description is too short', async () => {
			updates.description = 'a';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if description is too long', async () => {
			updates.description = new Array(1026).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if category is too short', async () => {
			updates.category = 'a';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if category is too long', async () => {
			updates.category = new Array(257).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if price is negative number', async () => {
			updates.price = -1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if quantity is negative number', async () => {
			updates.quantity = -1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if quantity is float', async () => {
			updates.quantity = 1.1;
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');
		});
		it('should return 400 error if item id is invalid', async () => {
			itemId = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/invalid id/i));
		});
		it('should return 404 error if there is no item with the passed ID', async () => {
			itemId = new mongoose.Types.ObjectId().toString();
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/not found/i));
		});
		it('should return 403 error if user _id is not the owner of the item', async () => {
			accountType = 'admin';
			email = 'admin@example.com';
			const admin = await getUser();
			token = await getToken(admin.email, '12345678');
			const res = await exec();
			expect(res.status).toBe(403);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/access denied/i));
		});
	});

	describe('DELETE /:id', () => {
		async function exec() {
			return await request(server)
				.delete('/item/' + itemId)
				.set('Authorization', 'Bearer ' + token);
		}
		let vendor, token, item, itemId;
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			token = await getToken(vendor.email, '12345678');
			item = await getItem(vendor._id);
			itemId = item._id.toString();
		});

		it('should delete item in db if valid ID is passed', async () => {
			await exec();
			const itemInDB = await Item.findById(itemId);
			expect(itemInDB).toBeNull();
		});
		it('should return item id if valid ID is passed', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('delete', true);
			expect(res.body).toHaveProperty('itemid', item._id.toString());
		});
		it('should return 400 error if invalid item ID is passed', async () => {
			itemId = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/invalid id/i));
		});
		it('should return 404 error if there is no item with the passed ID', async () => {
			itemId = new mongoose.Types.ObjectId().toString();
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/not found/i));
		});
		it('should return 403 error if user _id is not the owner of the item', async () => {
			accountType = 'admin';
			email = 'admin@example.com';
			const admin = await getUser();
			token = await getToken(admin.email, '12345678');
			const res = await exec();
			expect(res.status).toBe(403);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/access denied/i));
		});
	});
});
