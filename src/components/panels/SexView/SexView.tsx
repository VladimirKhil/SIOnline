import * as React from 'react';
import Sex from '../../../model/enums/Sex';
import localization from '../../../model/resources/localization';
import Selector from '../../common/Selector/Selector';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setSex } from '../../../state/settingsSlice';

interface SexViewProps {
	disabled: boolean | undefined;
}

export default function SexView(props: SexViewProps): JSX.Element {
	const sex = useAppSelector(state => state.settings.sex);
	const appDispatch = useAppDispatch();

	function onSexChanged(newSex: Sex): void {
		appDispatch(setSex(newSex));
	}

	return (
		<Selector
			className='sexArea'
			data={[{
				value: Sex.Male,
				name: '🧑',
				tooltip: localization.male
			}, {
				value: Sex.Female,
				name: '👩',
				tooltip: localization.female
			}]}
			value={sex}
			disabled={props.disabled}
			onValueChanged={onSexChanged}
		/>
	);
}