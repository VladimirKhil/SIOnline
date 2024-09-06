import * as React from 'react';
import localization from '../../model/resources/localization';

import './TimeSettingItem.css';

interface TimeSettingItemProps {
	label: string;
	value: number;
	maximum: number;
	onValueChanged: (newValue: number) => void;
}

export default function TimeSettingItem(props: TimeSettingItemProps): JSX.Element {
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);

		if (value > 0 && value <= props.maximum) {
			props.onValueChanged(value);
		}
	};

	return (
		<div className="block timeSettingItem">
			<div className="blockName">{props.label}</div>

			<div className='blockValue'>
				<input
					className='timeRange'
					type="range"
					value={props.value}
					min={1}
					max={props.maximum}
					onChange={onChange}
				/>

				<input
					className='timeValue'
					type='number'
					value={props.value}
					min={1}
					max={props.maximum}
					onChange={onChange}
				/>

				<span>{localization.sec}</span>
			</div>
		</div>
	);
}