import { take, delay, race, call, cancel } from 'redux-saga/effects';

const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

export const INIT = {
	'type': 'app/INIT',
};

export function *takeLocationChange (action = LOCATION_CHANGE) {
	yield take(action);
}

export function *raceTask (task, competingAction = LOCATION_CHANGE) {
	yield delay();
	const { value } = yield race({
		'value': call(task),
		'competitor': call(takeLocationChange, competingAction),
	});
	
	if (value) {
		return value;
	}
	else {
		yield cancel();
	}
}
