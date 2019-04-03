import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { configureStore } from './containers/store';
import App from './containers/app';
import { INIT } from './helpers/saga-helper';

const store = configureStore();
store.dispatch(INIT);

render((
	<AppContainer>
		<Provider store={store}>
			<App />
		</Provider>
	</AppContainer>
), document.getElementById('react-app'));
