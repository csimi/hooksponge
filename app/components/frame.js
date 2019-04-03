import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import {
	eventsGet,
} from '../actions/events';
import Event from './event';
import Information from './information';
import Favicon from '../public/favicon.ico';
import Logo from '../public/logo.png';

export class Frame extends Component {
	static propTypes = {
		'events': PropTypes.shape({
			'data': PropTypes.arrayOf(PropTypes.shape({
				'id': PropTypes.string,
				'timestamp': PropTypes.number,
				'message': PropTypes.object,
			})).isRequired,
			'active': PropTypes.shape({
				'id': PropTypes.string,
				'timestamp': PropTypes.number,
				'message': PropTypes.object,
			}).isRequired,
		}).isRequired,
		'EventsGet': PropTypes.func.isRequired,
	};
	
	componentDidMount () {
		this.props.EventsGet();
	}
	
	render () {
		const { data, active } = this.props.events;
		
		return (
			<div className="hooksponge">
				<Helmet>
					<title>HookSponge</title>
					<link rel="icon" href={Favicon} sizes="16x16 32x32 48x48" type="image/vnd.microsoft.icon" />
				</Helmet>
				<header>
					<h1><img src={Logo} alt="" />HookSponge</h1>
				</header>
				<div className="frame">
					<div className="events">
						<ul>
							{data.map((event) => <Event key={event.id} {...event} active={active.id} />)}
						</ul>
					</div>
					<Information {...active} />
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({ events }) => ({
	events,
});

const mapDispatchToProps = (dispatch) => ({
	EventsGet () {
		return dispatch(eventsGet());
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(Frame);
