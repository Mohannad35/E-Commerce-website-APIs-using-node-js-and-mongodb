import _ from 'lodash';
import Rate from './../model/rate.js';

export default class RateController {
	static async rates(req, res) {
		const { query } = req;
		const { total, remaining, paginationResult, rates } = await Rate.getRates(query);
		res.send({ length: rates.length, total, remaining, paginationResult, rates });
	}

	static async rate(req, res) {
		const { id } = req.params;
		const rate = await Rate.getRate(id);
		if (!rate) return res.status(404).send({ message: 'Rate not found' });
		res.status(200).send({ rate });
	}

	static async addRate(req, res) {
		const { _id } = req.user;
		const { itemId, rateValue, review } = req.body;
		const { err, status, message, rate } = await Rate.createRate(_id, itemId, rateValue, review);
		if (err) return res.status(status).send({ error: true, message });
		await rate
			.save()
			.then(() => res.status(201).send({ create: true, rate }))
			.catch(err => {
				if (err.code === 11000)
					res.status(400).send({ error: true, message: 'rate already exists.' });
				else throw err;
			});
	}

	static async updateRate(req, res) {
		const { id } = req.params;
		const { _id } = req.user;
		const { rateValue, review } = req.body;
		const { err, status, message, rate } = await Rate.editRate(id, _id, rateValue, review);
		if (err) return res.status(status).send({ error: true, message });
		await rate
			.save()
			.then(() => res.status(200).send({ update: true, rate }))
			.catch(err => {
				if (err.code === 11000)
					res.status(400).send({ error: true, message: 'list name already exists.' });
				else throw err;
			});
	}

	static async deleteRate(req, res) {
		const { _id } = req.user;
		const { id } = req.params;
		const { err, status, message, rate } = await Rate.deleteRate(id, _id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ delete: true, rate });
	}
}
