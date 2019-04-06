/* global module, require */

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';

import createRootReducer from '../reducers';
import rootSaga, { announceReplacement } from '../sagas';

function createReducer (rootReducer) {
	return rootReducer();
}

export function configureStore (initialState) {
	const sagaMiddleware = createSagaMiddleware();
	const composeEnhancers = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	const enhancer = composeEnhancers(
		applyMiddleware(
			thunk,
			sagaMiddleware,
		),
	);
	
	const store = createStore(
		createReducer(createRootReducer),
		initialState,
		enhancer
	);
	
	let sagaTask = sagaMiddleware.run(function *initialSaga () {
		yield rootSaga();
	});
	
	if (module.hot) {
		module.hot.accept('../reducers', () => store.replaceReducer(createReducer(require('../reducers').default)));
		module.hot.accept('../sagas', () => {
			const replacementSaga = require('../sagas').default;
			sagaTask.cancel();
			sagaTask.toPromise().then(() => {
				sagaTask = sagaMiddleware.run(function *replacedSaga () {
					yield replacementSaga([
						fork(announceReplacement),
					]);
				});
			});
		});
	}
	
	return store;
}
