import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import localization from '../model/resources/localization';
import Dialog from './common/Dialog';

import './About.css';

interface AboutProps {
	onClose: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onClose: () => {
		dispatch(actionCreators.navigateBack());
	}
});

export class About extends React.Component<AboutProps> {
	constructor(props: AboutProps) {
		super(props);
	}

	render() {
		return (
			<Dialog id="helpDialog" title={localization.aboutTitle} onClose={this.props.onClose}>
				<div className="helpText">
					<section>
						{localization.about.map(text => (<p key={text}>{text}</p>))}
					</section>
					<section>
						<header><h1 className="subHeader">{localization.aboutSupport}</h1></header>
						<p><a href="https://vk.com/topic-135725718_34967839">{localization.supportInfo}</a></p>
					</section>
					<section>
						<header><h1 className="subHeader">{localization.aboutAuthorLicense}</h1></header>
						<p>{localization.authorInfo}</p>
						<p><a href="https://github.com/VladimirKhil/SIOnline">{localization.sourcesInfo}</a></p>
						<p>{localization.licence}</p>
						<p>{localization.noWarranty}</p>
						<p>{localization.usedComponents}</p>
						<ul className="components">
							<li><a href="https://github.com/facebook/react/blob/master/LICENSE">React, React DOM (MIT)</a></li>
							<li><a href="https://github.com/reduxjs/redux/blob/master/LICENSE.md">Redux (MIT)</a></li>
							<li><a href="https://github.com/reduxjs/react-redux/blob/master/LICENSE.md">React-Redux (MIT)</a></li>
							<li><a href="https://github.com/reduxjs/redux-thunk/blob/master/LICENSE.md">Redux-Thunk (MIT)</a></li>
							<li><a href="https://github.com/ReactTraining/react-router/blob/master/LICENSE">React Router DOM (MIT)</a></li>
							<li><a href="https://github.com/stefanpenner/es6-promise/blob/master/LICENSE">ES6 Promise (MIT)</a></li>
							<li><a href="https://github.com/Stuk/jszip/blob/master/LICENSE.markdown">JSZip (MIT)</a></li>
							<li><a href="https://github.com/srijs/rusha/blob/master/LICENSE">Rusha (MIT)</a></li>
							<li>
								<a href="https://github.com/dotnet/aspnetcore/blob/master/LICENSE.txt">
									Microsoft SignalR, Microsoft SignalR MessagePack (Apache 2.0)
								</a>
							</li>
						</ul>
					</section>
				</div>
			</Dialog>
		);
	}
}

export default connect(null, mapDispatchToProps)(About);
