import express from 'express';
import { AsyncRouter } from 'express-async-router';
import bodyParser from 'body-parser';
import rewrite from 'express-urlrewrite';
import expressSSE from 'express-sse';
import env from 'env-var';
import ioredis from 'ioredis';
import compiler from './compiler';
import cache from './cache';
import {
	publicPath,
	dataPath,
	eventPath,
} from './config';

const NODE_ENV = env.get('NODE_ENV', 'development').asString();
const REDIS_KEY = env.get('REDIS_KEY', 'hooksponge').asString();

export function splitKey (key) {
	const id = key.toString('utf8');
	const [timestamp] = key.toString('utf8').split('-');
	
	return [id, Number(timestamp)];
}

export async function readEvents (max = '0', commands = ['STREAMS']) {
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

export async function getData () {
	return JSON.stringify(await readEvents(0));
}

export function saveData (sse) {
	return async (req) => {
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
	};
}

export async function decorateApp (app) {
	const sse = new expressSSE();
	const router = new AsyncRouter();
	
	app.use(bodyParser.raw({
		'type': () => true,
	}));
	
	if (NODE_ENV === 'production') {
		app.use(rewrite('/', `/${publicPath}/`));
		app.use(`/${publicPath}`, express.static(`dist/${publicPath}`));
	}
	else {
		app.use(rewrite('/', `/${publicPath}/`));
		(await compiler())(app);
	}
	
	app.use('/', router);
	router.get(`/${dataPath}`, getData);
	router.get(`/${eventPath}`, sse.init);
	router.all('*', saveData(sse));
	
	return app;
}

export const app = decorateApp(express());
export default app;
