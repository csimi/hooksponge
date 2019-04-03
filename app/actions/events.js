export const EVENTS_GET = 'app/events/GET';
export const EVENTS_SET = 'app/events/SET';
export const EVENTS_VIEW = 'app/events/VIEW';
export const EVENTS_ADD = 'app/events/ADD';
export const EVENTS_REMOVE = 'app/events/REMOVE';

export function eventsGet () {
	return {
		'type': EVENTS_GET,
	};
}

export function eventsSet (data) {
	return {
		'type': EVENTS_SET,
		'data': data,
	};
}

export function eventsView (id) {
	return {
		'type': EVENTS_VIEW,
		'id': id,
	};
}

export function eventsAdd (event) {
	return {
		'type': EVENTS_ADD,
		'event': event,
	};
}

export function eventsRemove (id) {
	return {
		'type': EVENTS_REMOVE,
		'id': id,
	};
}
