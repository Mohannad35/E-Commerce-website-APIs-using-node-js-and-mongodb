import compression from 'compression';
import helmet from 'helmet';
import config from 'config';

export default function (app) {
	if (config.get('env') === 'production') {
		app.use(helmet());
		app.user(compression());
	}
}
