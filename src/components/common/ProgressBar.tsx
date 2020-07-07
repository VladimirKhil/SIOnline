import * as React from 'react';

import './ProgressBar.css';

interface ProgressBarProps {
	className?: string;
	isIndeterminate?: boolean;
	value?: number;
}

// tslint:disable-next-line: function-name
export default function ProgressBar(props: ProgressBarProps) {
	const style: React.CSSProperties = props.isIndeterminate ? {} : {
		width: props.value ? `calc(${100 * props.value}%)` : '0'
	};

	return (
		<div className={`progress progress-striped active ${props.isIndeterminate ? 'indeterminate' : ''} ${props.className}`}>
			<div className="progress-bar" style={style} role="progressbar"
				aria-valuenow={props.isIndeterminate ? 100 : props.value} aria-valuemin={0} aria-valuemax={100}>
			</div>
		</div>
	);
}
