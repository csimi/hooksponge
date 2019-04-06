const express = require('express');
const router = require('express-async-router').AsyncRouter();
const bodyParser = require('body-parser');
const rewrite = require('express-urlrewrite');
const expressSSE = require('express-sse');
const env = require('env-var');
const ioredis = require('ioredis');
const cache = require('./cache');

const app = module.exports = express();
const sse = new expressSSE();

const NODE_ENV = env.get('NODE_ENV', 'development').asString();
const REDIS_KEY = env.get('REDIS_KEY', 'hooksponge').asString();

const {
	publicPath,
	dataPath,
	eventPath,
} = require('./config');

function splitKey (key) {
	const id = key.toString('utf8');
	const [timestamp] = key.toString('utf8').split('-');
	
	return [id, Number(timestamp)];
}

async function readEvents (max = '0', commands = ['STREAMS']) {
	const response = await cache.sendCommand(new ioredis.Command('XREAD', [...commands, REDIS_KEY, max]));
	
	if (response) {
		const [, events] = response[0];
		return events.map(([key, values]) => {
			const [id, timestamp] = splitKey(key);
			const message = JSON.parse(values[1].toString('utf8'));
			
			return {
				id,
				timestamp,
				message,
			};
		});
	}
	
	return [];
}

app.use(bodyParser.raw({
	'type': () => true,
}));

if (NODE_ENV === 'production') {
	app.use(rewrite('/', `/${publicPath}/`));
	app.use(`/${publicPath}`, express.static(`dist/${publicPath}`));
}
else {
	(() => {
		const compiler = require('./compiler');
		app.use(rewrite('/', `/${publicPath}/`));
		compiler(app);
	})();
}

app.use('/', router);

router.get(`/${dataPath}`, async function () {
	return JSON.stringify(await readEvents(0));
});

router.get(`/${eventPath}`, sse.init);

router.all('*', async function (req) {
	const message = {
		'protocol': req.protocol,
		'hostname': req.hostname,
		'method': req.method,
		'ip': req.ip,
		'headers': req.headers,
		'path': req.path,
		'query': req.query,
		'body': Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '',
	};
	
	cache
		.sendCommand(new ioredis.Command('XADD', [REDIS_KEY, '*', 'message', JSON.stringify(message)]))
		.then((key) => {
			const [id, timestamp] = splitKey(key);
			
			return sse.send({
				id,
				timestamp,
				message,
			}, 'push');
		})
		.catch(console.error);
	
	return JSON.stringify({});
});
