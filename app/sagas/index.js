import { all, put, delay } from 'redux-saga/effects';
import events from './events';
import notification from './notification';

export const SAGAS_REPLACED = '@@saga/REPLACED';
export const SAGAS_FAILED = '@@saga/FAILED';

export function *announceReplacement () {
	yield delay();
	yield put({
		'type': SAGAS_REPLACED,
	});
}

export default function *rootSaga (sagas = []) {
	try {
		yield all([
			...events,
			...notification,
			...sagas,
		]);
	}
	catch (err) {
		yield put({
			'type': SAGAS_FAILED,
		});
	}
}
