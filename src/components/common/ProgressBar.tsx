import * as React from 'react';

import './ProgressBar.css';

// tslint:disable-next-line: function-name
export default function ProgressBar() {
	return (
		<div className="progress progress-striped active">
			<div className="progress-bar" role="progressbar"
				aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
			</div>
		</div>
	);
}
