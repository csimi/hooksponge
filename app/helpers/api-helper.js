import axios, { CancelToken } from 'axios';
import { stringify } from 'qs';
import { CANCEL } from 'redux-saga';

export default function *(options = {}) {
	const { token, cancel } = CancelToken.source();
	const promise = axios.request({
		...options,
		'cancelToken': token,
		'paramsSerializer': stringify,
	});
	
	promise[CANCEL] = cancel;
	
	return yield promise;
}
