import { takeEvery, call, put } from 'redux-saga/effects';
import {
	NOTIFICATION_DISPLAY,
} from '../actions/notification';
import {
	eventsView,
} from '../actions/events';
import Logo from '../public/logo.png';

export function PromiseNotificaiton (...args) {
	return new Promise((resolve) => {
		const instance = new Notification(...args);
		instance.onclick = () => {
			instance.close();
			resolve();
		};
	});
}

function *notificationDisplay ({ event }) {
	try {
		if (Notification.permission !== 'granted') {
			return yield call(Notification.requestPermission);
		}
		
		const { message } = event;
		yield call(PromiseNotificaiton, `${message.method} on ${message.hostname}`, {
			'body': message.path,
			'icon': Logo,
		});
		yield put(eventsView(event.id));
	}
	catch (err) {
		console.error(err);
	}
}

export default [
	takeEvery(NOTIFICATION_DISPLAY, notificationDisplay),
];
