import * as React from 'react';

import './Selector.css';

interface SelectorValueOptions<T> {
	value: T;
	name: string;
	tooltip: string;
}

interface SelectorProps<T> {
	data: SelectorValueOptions<T>[];
	value: T;
	disabled: boolean | undefined;
	className?: string;
	onValueChanged: (newValue: T) => void;
}

export default function Selector<T>(props: SelectorProps<T>): JSX.Element {
	return (
		<div className={`selector ${props.className}`}>
			{props.data.map(item => (
				<button
					className={props.value === item.value ? 'unselectable' : ''}
					disabled={props.value === item.value || props.disabled}
					title={item.tooltip}
					onClick={() => props.onValueChanged(item.value)}>
					{item.name}
				</button>))}
		</div>
	);
}
