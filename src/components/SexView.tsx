import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Sex from '../model/enums/Sex';
import localization from '../model/resources/localization';
import settingsActionCreators from '../state/settings/settingsActionCreators';
import State from '../state/State';
import Selector from './common/Selector';

interface SexViewProps {
	sex: Sex;
	disabled: boolean | undefined;
	onSexChanged: (newSex: Sex) => void;
}

const mapStateToProps = (state: State) => ({
	sex: state.settings.sex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSexChanged: (newSex: Sex) => {
		dispatch(settingsActionCreators.onSexChanged(newSex));
	},
});

export function SexView(props: SexViewProps): JSX.Element {
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
			value={props.sex}
			disabled={props.disabled}
			onValueChanged={props.onSexChanged}
		/>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(SexView);