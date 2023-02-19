const request = require('supertest');
const Item = require('../../model/item');
const User = require('../../model/user');

describe('auth middleware', () => {
	let server, user, token;
	async function getUser() {
		return await User.create({
			name: 'user',
			email: 'user@example.com',
			password: '12345678',
			accountType: 'admin',
			phoneNumbers: [{ phoneNumber: '01234567890' }]
		});
	}

	async function getToken(email, password) {
		const { headers } = await request(server).post('/user/login').send({ email, password });
		return headers['x-auth-token'];
	}

	async function exec() {
		return await request(server)
			.post('/user/logout')
			.set('Authorization', token === '' ? '' : 'Bearer ' + token);
	}

	beforeEach(async () => {
		server = require('../../index');
		user = await getUser();
		token = await getToken(user.email, '12345678');
	});
	afterEach(async () => {
		server.close();
		await User.deleteMany({});
		// await Item.deleteMany({});
	});

	it('should return 200 if token is valid', async () => {
		const res = await exec();
		expect(res.status).toBe(200);
	});
	it('should return 401 if no token is provided', async () => {
		token = '';
		const res = await exec();
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty(
			'message',
			expect.stringMatching(/access denied|no token provided/i)
		);
	});
	it('should return 400 if token is invalid', async () => {
		token = 'a';
		const res = await exec();
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty(
			'message',
			expect.stringMatching(/access denied|invalid token/i)
		);
	});
});

describe('admin middleware', () => {
	let server, user, admin, token;
	async function getUser(email = 'user@example.com', type = 'client') {
		return await User.create({
			name: 'user',
			email: email,
			password: '12345678',
			accountType: type,
			phoneNumbers: [{ phoneNumber: '01234567890' }]
		});
	}

	async function getToken(email, password) {
		const { headers } = await request(server).post('/user/login').send({ email, password });
		return headers['x-auth-token'];
	}

	async function exec() {
		return await request(server)
			.get('/user')
			.set('Authorization', token ? 'Bearer ' + token : '');
	}

	beforeEach(async () => {
		server = require('../../index');
		admin = await getUser('admin@example.com', 'admin');
		user = await getUser('user@example.com');
		token = await getToken(admin.email, '12345678');
	});
	afterEach(async () => {
		server.close();
		await User.deleteMany({});
	});

	it('should return 200 if token belongs to an admin', async () => {
		const res = await exec();
		expect(res.status).toBe(200);
	});
	it(`should return 403 if token doesn't belong to an admin`, async () => {
		token = await getToken(user.email, '12345678');
		const res = await exec();
		expect(res.status).toBe(403);
		expect(res.body).toHaveProperty('message', expect.stringMatching(/access denied/i));
	});
});

describe('vendor middleware', () => {
	let server, user, vendor, token, newItem;
	async function getUser(email = 'user@example.com', type = 'client') {
		return await User.create({
			name: 'user',
			email: email,
			password: '12345678',
			accountType: type,
			phoneNumbers: [{ phoneNumber: '01234567890' }]
		});
	}

	async function getToken(email, password) {
		const { headers } = await request(server).post('/user/login').send({ email, password });
		return headers['x-auth-token'];
	}

	async function exec() {
		return await request(server)
			.post('/item')
			.set('Authorization', 'Bearer ' + token)
			.send(newItem);
	}

	beforeEach(async () => {
		server = require('../../index');
		vendor = await getUser('vendor@example.com', 'vendor');
		user = await getUser('user@example.com');
		token = await getToken(vendor.email, '12345678');
		newItem = {
			name: 'new item',
			description: 'description',
			category: 'category',
			price: 100,
			quantity: 10
		};
	});
	afterEach(async () => {
		server.close();
		await User.deleteMany({});
		await Item.deleteMany({});
	});

	it('should return 201 if token belongs to a vendor', async () => {
		const res = await exec();
		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('create', true);
		expect(res.body).toHaveProperty('itemid');
		expect(res.body.item).toMatchObject(newItem);
	});
	it(`should return 403 if token doesn't belong to a vendor`, async () => {
		token = await getToken(user.email, '12345678');
		const res = await exec();
		expect(res.status).toBe(403);
		expect(res.body).toHaveProperty('message', expect.stringMatching(/access denied/i));
	});
});
