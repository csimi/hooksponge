import { takeLatest, call, put } from 'redux-saga/effects';
import api from '../helpers/api-helper';
import {
	EVENTS_GET,
	eventsSet,
} from '../actions/events';
import {
	dataPath,
} from '../../src/config';

function *eventsGet () {
	try {
		const { data } = yield call(api, {
			'url': `/${dataPath}`,
		});
		
		yield put(eventsSet(data));
		return data;
	}
	catch (err) {
		// nope
	}
}

export default [
	takeLatest(EVENTS_GET, eventsGet),
];
