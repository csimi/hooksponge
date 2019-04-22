import memoizeOne from 'memoize-one';

export async function createDecorator () {
	const webpack = (await import('webpack')).default;
	const dev = (await import('webpack-dev-middleware')).default;
	const hot = (await import('webpack-hot-middleware')).default;
	const config = (await import('../webpack.config.js')).default;
	
	const compiler = webpack(config);
	const devMiddleware = dev(compiler, config.devServer);
	const hotMiddleware = hot(compiler);
	
	return (app) => {
		app.use(devMiddleware);
		app.use(hotMiddleware);
		
		return app;
	};
}

export function isEqual () {
	return true;
}

export default memoizeOne(createDecorator, isEqual);
