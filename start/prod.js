import compression from 'compression';
import helmet from 'helmet';
import config from 'config';

export default function (app) {
	if (process.env.NODE_ENV === 'production') {
		app.use(helmet());
		app.user(compression());
	}
}
