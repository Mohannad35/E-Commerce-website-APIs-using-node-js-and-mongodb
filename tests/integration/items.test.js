import _ from 'lodash';
import request from 'supertest';
import mongoose from 'mongoose';
import Item from '../../model/item.js';
import User from '../../model/user.js';
import Category from '../../model/category.js';
import server from '../../index.js';

describe('/item', () => {
	afterAll(() => {
		server.close();
	});
	let name, email, password, accountType, phoneNumber;
	let itemName, description, title, price, quantity;
	async function getCategory() {
		return await Category.create({ title });
	}
	async function getUser() {
		return await User.create({
			name,
			email,
			password,
			accountType,
			phoneNumbers: [{ phoneNumber }]
		});
	}
	async function getItem(owner, category) {
		return await Item.create({
			owner: { _id: owner._id, name: owner.name },
			name: itemName,
			description,
			category: { _id: category._id, title: category.title },
			price,
			quantity
		});
	}
	async function getToken(email, password) {
		const { headers } = await request(server).post('/api/user/login').send({ email, password });
		return headers['x-auth-token'];
	}
	beforeEach(async () => {
		itemName = 'item';
		description = 'description';
		title = 'category';
		price = 100;
		quantity = 10;
		name = 'John';
		email = 'John@example.com';
		password = '12345678';
		accountType = 'client';
		phoneNumber = '01234567890';
	});
	afterEach(async () => {
		// await server.close();
		await Item.deleteMany({});
		await User.deleteMany({});
		await Category.deleteMany({});
	});

	describe('GET /', () => {
		let vendor,
			category,
			items = [];
		async function exec() {
			return await request(server).get('/api/item');
		}
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			category = await getCategory();
			items[0] = await getItem(vendor, category);
			items[1] = await getItem(vendor, category);
		});
		it('should return 200 all items', async () => {
			const res = await exec();
			const { body, status } = res;
			expect(status).toBe(200);
			expect(body.items).toHaveLength(2);
			expect(body.items[0]).toMatchObject(
				_.pick(items[0], ['name', 'description', 'price', 'quantity'])
			);
			expect(body.items[0]).toHaveProperty('_id', items[0]._id.toString());
			expect(body.items[0]).toHaveProperty('owner', vendor._id.toString());
			expect(body.items[0]).toHaveProperty('category', category._id.toString());
			expect(body.items[1]).toMatchObject(
				_.pick(items[1], ['name', 'description', 'price', 'quantity'])
			);
			expect(body.items[1]).toHaveProperty('_id', items[1]._id.toString());
			expect(body.items[1]).toHaveProperty('owner', vendor._id.toString());
			expect(body.items[1]).toHaveProperty('category', category._id.toString());
		});
	});

	describe('GET /:id', () => {
		let vendor, category, item, itemId;
		async function exec() {
			return await request(server).get('/api/item/' + itemId);
		}
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			category = await getCategory();
			item = await getItem(vendor, category);
			itemId = item._id.toString();
		});
		it('should return 200 with item if id belongs to an item in db', async () => {
			const res = await exec();
			const { status, body } = res;
			expect(status).toBe(200);
			expect(body.item).toMatchObject(_.pick(item, ['name', 'description', 'price', 'quantity']));
			expect(body.item).toHaveProperty('_id', itemId);
			expect(body.item).toHaveProperty('owner', vendor._id.toString());
			expect(body.item).toHaveProperty('category', category._id.toString());
		});
		it('should return 400 error if item id is invalid', async () => {
			itemId = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/^invalid.*id.*/i));
		});
		it(`should return 404 error if id doesn't belong to an item in db`, async () => {
			itemId = new mongoose.Types.ObjectId().toString();
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/not found/i));
		});
	});

	describe('POST /', () => {
		async function exec(name, description, categoryId, price, quantity) {
			name = name || 'new item';
			description = description || 'description';
			categoryId = categoryId || category._id.toString();
			price = price || '100';
			quantity = quantity || '10';
			return await request(server)
				.post('/api/item')
				.set('Authorization', 'Bearer ' + token)
				.field('name', name)
				.field('description', description)
				.field('category', categoryId)
				.field('price', price)
				.field('quantity', quantity);
		}
		let vendor, category, token, newItem;
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			category = await getCategory();
			token = await getToken(vendor.email, '12345678');
			newItem = {
				name: 'new item',
				description: 'description',
				category: category._id,
				price: 100,
				quantity: 10
			};
		});

		it('should add an item to db if valid input is passed', async () => {
			await exec();
			const itemInDB = await Item.findOne({ name: newItem.name });
			expect(itemInDB).toMatchObject(newItem);
		});
		it('should return 201 with added item if valid input is provided by a vendor', async () => {
			const res = await exec();
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty('create', true);
			expect(res.body).toHaveProperty('itemid');
			expect(res.body.item).toMatchObject(_.pick(newItem, 'name description price quantity'));
			expect(res.body.item).toHaveProperty('category', category._id.toString());
		});
		it('should return 400 error if name is too short', async () => {
			const res = await exec('1');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*name.*/i));
		});
		it('should return 400 error if name is too long', async () => {
			const res = await exec(new Array(257).join('a'));
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*name.*/i));
		});
		it(`should return 400 error if name doesn't start with a letter`, async () => {
			const res = await exec('#item');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*name.*/i));
		});
		it('should return 400 error if description is too short', async () => {
			const res = await exec(undefined, '1');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*description.*/i));
		});
		it('should return 400 error if description is too long', async () => {
			const res = await exec(null, new Array(1026).join('a'));
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*description.*/i));
		});
		it('should return 400 error if category id is not a valid mongodb id', async () => {
			const res = await exec(null, null, '1');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*category.*/i));
		});
		it(`should return 404 error if category id doesn't belong to an existing category`, async () => {
			const res = await exec(null, null, new mongoose.Types.ObjectId().toString());
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*not.*found.*/i));
		});
		it('should return 400 error if price is negative number', async () => {
			const res = await exec(null, null, null, -1);
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*price.*/i));
		});
		it('should return 400 error if quantity is negative number', async () => {
			const res = await exec(null, null, null, null, -1);
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*quantity.*/i));
		});
		it('should return 400 error if quantity is float', async () => {
			const res = await exec(null, null, null, null, 1.1);
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*quantity.*/i));
		});
	});

	describe('PATCH /:id', () => {
		async function exec(name, description, categoryId, price, quantity) {
			name = name || 'new name';
			description = description || 'new description';
			categoryId = categoryId || category._id.toString();
			price = price || '20';
			quantity = quantity || '5';
			return await request(server)
				.patch('/api/item/' + itemId)
				.set('Authorization', 'Bearer ' + token)
				.field('name', name)
				.field('description', description)
				.field('category', categoryId)
				.field('price', price)
				.field('quantity', quantity);
		}
		let vendor, category, token, item, updates, itemId;
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			category = await getCategory();
			token = await getToken(vendor.email, '12345678');
			item = await getItem(vendor, category);
			itemId = item._id.toString();
			updates = {
				name: 'new name',
				description: 'new description',
				category: category._id.toString(),
				price: 20,
				quantity: 5
			};
		});

		it('should update in db if valid updates is provided by a vendor', async () => {
			await exec();
			const itemInDB = await Item.findOne({ name: updates.name });
			expect(_.pick(itemInDB, ['name', 'description', 'price', 'quantity'])).toMatchObject(
				_.pick(updates, ['name', 'description', 'price', 'quantity'])
			);
		});
		it('should return 200 if valid updates is provided by a vendor', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('update', true);
			expect(res.body).toHaveProperty('itemid');
		});
		it('should return 400 error if name is too short', async () => {
			const res = await exec('a');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*name.*/i));
		});
		it('should return 400 error if name is too long', async () => {
			const res = await exec(new Array(257).join('a'));
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*name.*/i));
		});
		it('should return 400 error if description is too short', async () => {
			const res = await exec(null, 'a');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*description.*/i));
		});
		it('should return 400 error if description is too long', async () => {
			const res = await exec(null, new Array(1026).join('a'));
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*description.*/i));
		});
		it('should return 400 error if categoryId is not a valid mongodb id', async () => {
			const res = await exec(null, null, '1');
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*category.*/i));
		});
		it(`should return 404 error if categoryId doesn't belong to an existing category`, async () => {
			const res = await exec(null, null, new mongoose.Types.ObjectId().toString());
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*not.*found.*/i));
		});
		it('should return 400 error if price is negative number', async () => {
			const res = await exec(null, null, null, -1);
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*price.*/i));
		});
		it('should return 400 error if quantity is negative number', async () => {
			const res = await exec(null, null, null, null, -1);
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*quantity.*/i));
		});
		it('should return 400 error if quantity is float', async () => {
			const res = await exec(null, null, null, null, 1.1);
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*quantity.*/i));
		});
		it('should return 400 error if item id is invalid', async () => {
			itemId = '1';
			const res = await exec();
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*invalid.*id.*/i));
		});
		it('should return 404 error if there is no item with the passed ID', async () => {
			itemId = new mongoose.Types.ObjectId().toString();
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*not.*found.*/i));
		});
		it('should return 403 error if user _id is not the owner of the item', async () => {
			accountType = 'admin';
			email = 'admin@example.com';
			const admin = await getUser();
			token = await getToken(admin.email, '12345678');
			const res = await exec();
			expect(res.status).toBe(403);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*access.*denied.*/i));
		});
	});

	describe('DELETE /:id', () => {
		async function exec() {
			return await request(server)
				.delete('/api/item/' + itemId)
				.set('Authorization', 'Bearer ' + token);
		}
		let vendor, category, token, item, itemId;
		beforeEach(async () => {
			accountType = 'vendor';
			vendor = await getUser();
			category = await getCategory();
			token = await getToken(vendor.email, '12345678');
			item = await getItem(vendor, category);
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
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*invalid.*id.*/i));
		});
		it('should return 404 error if there is no item with the passed ID', async () => {
			itemId = new mongoose.Types.ObjectId().toString();
			const res = await exec();
			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*not.*found.*/i));
		});
		it('should return 403 error if user _id is not the owner of the item', async () => {
			accountType = 'admin';
			email = 'admin@example.com';
			const admin = await getUser();
			token = await getToken(admin.email, '12345678');
			const res = await exec();
			expect(res.status).toBe(403);
			expect(res.body).toHaveProperty('message', expect.stringMatching(/.*access.*denied.*/i));
		});
	});
});
