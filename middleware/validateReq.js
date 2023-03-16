export default function (obj, validator) {
	return (req, res, next) => {
		const { error } = validator(req[obj]);
		if (error) {
			let errorMessage = '';
			for (err of error.details) errorMessage = errorMessage.concat(err.message, '. ');
			return res.status(400).send({ error: true, message: errorMessage.replace(/"/g, '') });
		}
		next();
	};
}
