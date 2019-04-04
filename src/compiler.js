const webpack = require('webpack');
const dev = require('webpack-dev-middleware');
const hot = require('webpack-hot-middleware');
const config = require('../webpack.config.js');

module.exports = (() => {
	const compiler = webpack(config);
	const devMiddleware = dev(compiler, config.devServer);
	const hotMiddleware = hot(compiler);
	
	return (app) => {
		app.use(devMiddleware);
		app.use(hotMiddleware);
		
		return app;
	};
})();
