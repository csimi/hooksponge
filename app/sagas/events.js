import { eventChannel } from 'redux-saga';
import { takeLatest, take, call, put, cancelled } from 'redux-saga/effects';
import api from '../helpers/api-helper';
import {
	EVENTS_GET,
	eventsSet,
	eventsAdd,
} from '../actions/events';
import {
	notificationDisplay,
} from '../actions/notification';
import {
	dataPath,
	eventPath,
} from '../../src/config';
import {
	INIT,
} from '../helpers/saga-helper';

const SAGAS_REPLACED = '@@saga/REPLACED';

function sourceChannel () {
	const source = new EventSource(`/${eventPath}`);
	return eventChannel((emit) => {
		source.addEventListener('push', emit);
		return () => {
			source.removeEventListener('push', emit);
			return source.close();
		};
	});
}

function *eventsListen () {
	const chan = yield call(sourceChannel);
	try {
		while (true) {
			const { data } = yield take(chan);
			const event = JSON.parse(data);
			
			yield put(eventsAdd(event));
			yield put(notificationDisplay(event));
		}
	}
	catch (err) {
		console.error(err);
	}
	finally {
		if (yield cancelled()) {
			chan.close();
		}
	}
}

function *eventsGet () {
	try {
		const { data } = yield call(api, {
			'url': `/${dataPath}`,
		});
		
		yield put(eventsSet(data));
		return data;
	}
	catch (err) {
		console.error(err);
	}
}

export default [
	takeLatest([INIT.type, SAGAS_REPLACED], eventsListen),
	takeLatest(EVENTS_GET, eventsGet),
];
