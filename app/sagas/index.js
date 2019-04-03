import { all, put } from 'redux-saga/effects';
import events from './events';

export const SAGAS_REPLACED = '@@saga/REPLACED';
export const SAGAS_FAILED = '@@saga/FAILED';

export default function *rootSaga () {
	try {
		yield all([
			...events,
		]);
	}
	catch (err) {
		yield put({
			'type': SAGAS_FAILED,
		});
	}
}
