import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { parse } from 'cookie';
import { ObjectInspector, DOMInspector } from 'react-inspector';
import Splash from '../public/splash.png';

const parseErrorNS = (new DOMParser())
	.parseFromString('<', 'text/xml')
	.getElementsByTagName('parsererror')[0].namespaceURI;

export function sortByKey (entries = []) {
	return entries.slice().sort(([key1], [key2]) => {
		if (key1 < key2) {
			return -1;
		}
		else if (key1 > key2) {
			return 1;
		}
		
		return 0;
	});
}

export function saneDOMParser (body) {
	const doc = (new DOMParser()).parseFromString(body, 'application/xml');
	
	const err = doc.getElementsByTagNameNS(parseErrorNS, 'parsererror');
	if (err.length > 0) {
		throw new Error(`DOMParser: ${err[0].innerText.split('\n')[0]}`);
	}
	
	return doc;
}

export default class Event extends Component {
	static propTypes = {
		'id': PropTypes.string,
		'timestamp': PropTypes.number,
		'message': PropTypes.object,
	};
	
	state = {
		'parseBody': true,
		'expandLevel': 1,
	};
	
	enableParse = () => this.setState({
		'parseBody': true,
	});
	
	disableParse = () => this.setState({
		'parseBody': false,
	});
	
	render () {
		const { timestamp, message } = this.props;
		const { parseBody, expandLevel } = this.state;
		
		const headers = message && message.headers ? sortByKey(Object.entries(message.headers)) : [];
		const cookies = message && message.headers && message.headers.cookie ? Object.entries(parse(message.headers.cookie)) : [];
		const query = message && message.query ? sortByKey(Object.entries(message.query)) : [];
		const body = message && message.body ? (() => {
			if (!parseBody) {
				return message.body;
			}
			
			try {
				const data = JSON.parse(message.body);
				return <ObjectInspector data={data} expandLevel={expandLevel} />;
			}
			catch {
				try {
					const doc = saneDOMParser(message.body);
					return <DOMInspector data={doc.documentElement} expandLevel={expandLevel} />;
				}
				catch {
					return message.body;
				}
			}
		})() : '(no body content)';
		
		return message ? (
			<div className="information">
				<section>
					<h2>Basics</h2>
					<table><tbody>
						<tr>
							<th>Date</th>
							<td>{format(new Date(timestamp), 'YYYY-MM-DD HH:mm:ss [UTC]ZZ')}</td>
						</tr>
						<tr>
							<th>IP</th>
							<td>{message.ip}</td>
						</tr>
						<tr>
							<th>Protocol</th>
							<td>{message.protocol}</td>
						</tr>
						<tr>
							<th>Method</th>
							<td><span className={`method ${message.method.toLowerCase()}`}>{message.method}</span></td>
						</tr>
						<tr>
							<th>Host</th>
							<td>{message.headers && message.headers.host ? message.headers.host : message.hostname}</td>
						</tr>
						<tr>
							<th>Path</th>
							<td>{message.path}</td>
						</tr>
					</tbody></table>
				</section>
				<section>
					<h2>Headers</h2>
					{headers.length ? (
						<table><tbody>
							{headers.map(([key, value]) => (
								<tr key={key}>
									<th>{key}</th>
									<td>{value}</td>
								</tr>
							))}
						</tbody></table>
					) : (
						<p>(empty)</p>
					)}
				</section>
				<section>
					<h2>Cookies</h2>
					{cookies.length ? (
						<table><tbody>
							{cookies.map(([key, value]) => (
								<tr key={key}>
									<th>{key}</th>
									<td>{value}</td>
								</tr>
							))}
						</tbody></table>
					) : (
						<p>(empty)</p>
					)}
				</section>
				<section>
					<h2>Query string</h2>
					{query.length ? (
						<table><tbody>
							{query.map(([key, value]) => (
								<tr key={key}>
									<th>{key}</th>
									<td>{typeof value === 'string' ? value : <ObjectInspector data={value} />}</td>
								</tr>
							))}
						</tbody></table>
					) : (
						<p>(empty)</p>
					)}
				</section>
				<section>
					<h2>Body (<a onClick={this.enableParse}>parse</a> - <a onClick={this.disableParse}>raw</a>)</h2>
					<div className="body"><pre>{body}</pre></div>
				</section>
			</div>
		) : (
			<div className="splash">
				<img src={Splash} alt="" />
			</div>
		);
	}
}
