import {
	EVENTS_SET,
	EVENTS_VIEW,
	EVENTS_ADD,
	EVENTS_REMOVE,
} from '../actions/events';

export const defaultData = {
	'data': [],
	'active': {},
};

const eventsReducer = (state = defaultData, action) => {
	switch (action.type) {
		case EVENTS_SET:
			return {
				...state,
				'data': action.data,
			};
		case EVENTS_VIEW:
			return {
				...state,
				'active': state.data.find(({ id }) => id === action.id) || {},
			};
		case EVENTS_ADD:
			return {
				...state,
				'data': state.data.concat(action.event),
			};
		case EVENTS_REMOVE:
			return {
				...state,
				'data': state.data.filter(({ id }) => id !== action.id),
			};
		default:
			return state;
	}
};

export default eventsReducer;
