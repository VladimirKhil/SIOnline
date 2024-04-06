import * as React from 'react';
import localization from '../../../model/resources/localization';

import './Loading.css';

export default function Loading(): JSX.Element {
	return (
		<div className="loadingGame">
			<div className="loadingHost">
				<div className="roundProgress" />
				<span>{localization.gameLoading}</span>
			</div>
		</div>
	);
}
