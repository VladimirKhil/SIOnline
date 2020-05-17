import * as React from 'react';
import localization from '../model/resources/localization';

import './Loading.css';

export default class Loading extends React.Component {
	render() {
		return (
			<div id="loadingGame">
				<div className="roundProgress" />
				<span>{localization.gameLoading}</span>
			</div>
		);
	}
}
