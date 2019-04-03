const express = require('express');
const router = require('express-async-router').AsyncRouter();
const bodyParser = require('body-parser');
const rewrite = require('express-urlrewrite');
const env = require('env-var');
const ioredis = require('ioredis');
const cache = require('./cache');

const app = module.exports = express();

const NODE_ENV = env.get('NODE_ENV', 'development').asString();
const REDIS_KEY = env.get('REDIS_KEY', 'hooksponge').asString();

const {
	publicPath,
	dataPath,
} = require('./config');

app.use(bodyParser.raw({
	'type': () => true,
}));

if (NODE_ENV === 'production') {
	app.use(rewrite('/', `/${publicPath}/`));
	app.use(`/${publicPath}`, express.static(`dist/${publicPath}`));
}
else {
	(() => {
		const webpack = require('webpack');
		const dev = require('webpack-dev-middleware');
		const hot = require('webpack-hot-middleware');
		const config = require('../webpack.config.js');
		const compiler = webpack(config);
		
		app.use(rewrite('/', `/${publicPath}/`));
		app.use(dev(compiler, config.devServer));
		app.use(hot(compiler));
	})();
}

app.use('/', router);

router.get(`/${dataPath}`, async function () {
	const response = await cache.sendCommand(new ioredis.Command('XREAD', ['STREAMS', REDIS_KEY, 0]));
	if (response) {
		const [, events] = response[0];
		const data = events.map(([key, values]) => ({
			'id': key.toString('utf8'),
			'timestamp': Number(key.toString('utf8').split('-')[0]),
			'message': JSON.parse(values[1].toString('utf8')),
		}));
		
		return JSON.stringify(data);
	}
	
	return JSON.stringify([]);
});

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
	
	cache.sendCommand(new ioredis.Command('XADD', [REDIS_KEY, '*', 'message', JSON.stringify(message)]));
	
	return JSON.stringify({});
});
