const promisify = require('util').promisify;
const createCertificate = promisify(require('pem').createCertificate);
const env = require('env-var');
const https = require('https');

const BIND_HOST = env.get('BIND_HOST', '0.0.0.0').asString();
const BIND_PORT = env.get('BIND_PORT', 3000).asIntPositive();

const app = require('./src/app');
app.listen(BIND_PORT, BIND_HOST);
app.listen(80);

(async () => {
	try {
		const { serviceKey, certificate } = await createCertificate({
			'days': 1,
			'selfSigned': true,
		});
		
		https.createServer({
			'key': serviceKey,
			'cert': certificate,
		}, app).listen(443);
	}
	catch {
		console.warn('openssl certificate generation error');
	}
})();
