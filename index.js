const promisify = require('util').promisify;
const createCertificate = promisify(require('pem').createCertificate);
const env = require('env-var');
const http = require('http');
const https = require('https');

const NODE_ENV = env.get('NODE_ENV', 'development').asString();
const BIND_HOST = env.get('BIND_HOST', '0.0.0.0').asString();
const BIND_PORT = env.get('BIND_PORT', 3000).asIntPositive();

const appModule = './src/app.js';
let app = require(appModule);

function callback (...args) {
	return app.apply(this, args);
}

http.createServer(callback).listen(BIND_PORT, BIND_HOST);
http.createServer(callback).listen(80);

(async () => {
	try {
		const { serviceKey, certificate } = await createCertificate({
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
})();

if (NODE_ENV !== 'production') {
	try {
		const chokidar = require('chokidar');
		const clearModule = require('clear-module');
		
		chokidar.watch([
			appModule,
		], {
			'ignoreInitial': true,
			'usePolling': true,
		}).on('all', () => {
			clearModule(appModule);
			app = require(appModule);
		});
	}
	catch {
		console.warn('dev dependencies error');
	}
}
