import { combineReducers } from 'redux';
import events from './events';

export default () => {
	return combineReducers({
		events,
	});
};
