import * as React from 'react';

import './ProgressBar.css';

interface ProgressBarProps {
	className?: string;
}

// tslint:disable-next-line: function-name
export default function ProgressBar(props: ProgressBarProps) {
	return (
		<div className={`progress progress-striped active ${props.className}`}>
			<div className="progress-bar" role="progressbar"
				aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
			</div>
		</div>
	);
}
