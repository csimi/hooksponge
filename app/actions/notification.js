export const NOTIFICATION_DISPLAY = 'app/notification/display';

export function notificationDisplay (event) {
	return {
		'type': NOTIFICATION_DISPLAY,
		'event': event,
	};
}
