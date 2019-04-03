import React from 'react';
import { hot } from 'react-hot-loader/root';
import Frame from '../components/frame';

import 'normalize.css';
import '../styles/style.css';

export const App = () => {
	return (
		<Frame />
	);
};

export default hot(App);
