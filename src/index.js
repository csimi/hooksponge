import { promisify } from 'util';
import path from 'path';
import http from 'http';
import https from 'https';
import env from 'env-var';
import { createCertificate } from 'pem';
import appModule from './app.js';

const NODE_ENV = env.get('NODE_ENV', 'development').asString();
const BIND_HOST = env.get('BIND_HOST', '0.0.0.0').asString();
const BIND_PORT = env.get('BIND_PORT', 3000).asIntPositive();

let app = appModule;

async function callback (...args) {
	return (await app).apply(this, args);
}

http.createServer(callback).listen(BIND_PORT, BIND_HOST);
http.createServer(callback).listen(80);

const createCertificatePromise = promisify(createCertificate);

(async () => {
	try {
		const { serviceKey, certificate } = await createCertificatePromise({
			'days': 365,
			'selfSigned': true,
		});
		
		https.createServer({
			'key': serviceKey,
			'cert': certificate,
		}, callback).listen(443);
	}
	catch {
		console.warn('openssl certificate generation error');
	}
	
	if (NODE_ENV !== 'production') {
		try {
			const watch = (await import('chokidar')).watch;
			const clearModule = (await import('clear-module')).default;
			
			watch([
				path.join(__dirname, 'app.js'),
			], {
				'ignoreInitial': true,
				'usePolling': true,
			}).on('all', async () => {
				clearModule('./app.js');
				app = (await import('./app.js')).app;
			});
		}
		catch {
			console.warn('dev dependencies error');
		}
	}
})();
