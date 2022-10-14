import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Sex from '../model/enums/Sex';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import settingsActionCreators from '../state/settings/settingsActionCreators';
import State from '../state/State';

import './SexView.css';

interface SexViewProps {
	sex: Sex;
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
		<div className='sexArea'>
			<button disabled={props.sex === Sex.Male} title={localization.male} onClick={() => props.onSexChanged(Sex.Male)}>🧑</button>
			<button disabled={props.sex === Sex.Female} title={localization.female} onClick={() => props.onSexChanged(Sex.Female)}>👩</button>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(SexView);