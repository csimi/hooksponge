import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { format } from 'date-fns';
import {
	eventsView,
	eventsRemove,
} from '../actions/events';

export class Event extends Component {
	static propTypes = {
		'id': PropTypes.string.isRequired,
		'timestamp': PropTypes.number.isRequired,
		'message': PropTypes.object.isRequired,
		'active': PropTypes.string,
		'EventsView': PropTypes.func.isRequired,
		'EventsRemove': PropTypes.func.isRequired,
	};
	
	viewThis = () => {
		return this.props.EventsView(this.props.id);
	};
	
	removeThis = () => {
		return this.props.EventsRemove(this.props.id);
	};
	
	render () {
		const { id, timestamp, message, active } = this.props;
		
		return (
			<li className={id === active ? 'active' : ''}>
				<a className="view-event" onClick={this.viewThis}>
					<p>{format(new Date(timestamp), 'YYYY-MM-DD HH:mm:ss')}</p>
					<p title={message.headers.host}>{message.headers.host}</p>
					<p title={message.path}><span className={`method ${message.method.toLowerCase()}`}>{message.method}</span> {message.path}</p>
				</a>
				<a className="remove-event" onClick={this.removeThis}></a>
			</li>
		);
	}
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
	EventsView (id) {
		return dispatch(eventsView(id));
	},
	EventsRemove (id) {
		return dispatch(eventsRemove(id));
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(Event);
