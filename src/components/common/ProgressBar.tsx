import * as React from 'react';

import './ProgressBar.css';

interface ProgressBarProps {
	className?: string;
	isIndeterminate?: boolean;
	value?: number;
	valueChangeDuration?: number;
	title?: string;
	children?: any;
}

export default function ProgressBar(props: ProgressBarProps): JSX.Element {
	let style: React.CSSProperties = props.isIndeterminate ? {} : {
		width: props.value ? `calc(${100 * props.value}%)` : '0'
	};

	if (props.valueChangeDuration) {
		style = {
			...style,
			animationName: 'widthZero',
			animationFillMode: 'forwards',
			animationDuration: `${props.valueChangeDuration}s`,
			animationTimingFunction: 'linear'
		};
	}

	return (
		<div
			className={`progress progress-striped active ${props.isIndeterminate ? 'indeterminate' : ''} ${props.className}`}
			title={props.title}
		>
			<div
				className="progress-bar"
				style={style}
				role="progressbar"
				aria-label="progress"
				aria-valuenow={props.isIndeterminate ? 100 : props.value}
				aria-valuemin={0}
				aria-valuemax={100}
			/>

			{props.children}
		</div>
	);
}
