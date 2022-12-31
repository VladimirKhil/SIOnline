import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import TimeSettings from '../../client/contracts/TimeSettings';
import localization from '../../model/resources/localization';
import TimeSettingItem from './TimeSettingItem';
import settingsActionCreators from '../../state/settings/settingsActionCreators';

import './TimeSettingsView.css';

interface TimeSettingsViewProps {
	settings: TimeSettings;
	onTimeSettingChanged: (name: keyof(TimeSettings), value: number) => void;
}

const mapStateToProps = (state: State) => ({
	settings: state.settings.appSettings.timeSettings
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onTimeSettingChanged: (name: keyof(TimeSettings), value: number) => dispatch(settingsActionCreators.onTimeSettingChanged(name, value))
});

export function TimeSettingsView(props: TimeSettingsViewProps): JSX.Element {
	return (
		<div className="timeSettingsView">
			<TimeSettingItem
				label={localization.timeForChoosingQuestion}
				value={props.settings.timeForChoosingQuestion}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForChoosingQuestion', value)} />
			<TimeSettingItem
				label={localization.timeForThinkingOnQuestion}
				value={props.settings.timeForThinkingOnQuestion}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForThinkingOnQuestion', value)} />
			<TimeSettingItem
				label={localization.timeForPrintingAnswer}
				value={props.settings.timeForPrintingAnswer}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForPrintingAnswer', value)} />
			<TimeSettingItem
				label={localization.timeForGivingACat}
				value={props.settings.timeForGivingACat}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForGivingACat', value)} />
			<TimeSettingItem
				label={localization.timeForMakingStake}
				value={props.settings.timeForMakingStake}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForMakingStake', value)} />
			<TimeSettingItem
				label={localization.timeForThinkingOnSpecial}
				value={props.settings.timeForThinkingOnSpecial}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForThinkingOnSpecial', value)} />
			<TimeSettingItem
				label={localization.timeForRightAnswer}
				value={props.settings.timeForRightAnswer}
				maximum={10}
				onValueChanged={value => props.onTimeSettingChanged('timeForRightAnswer', value)} />
			<TimeSettingItem
				label={localization.timeOfRound}
				value={props.settings.timeOfRound}
				maximum={10800}
				onValueChanged={value => props.onTimeSettingChanged('timeOfRound', value)} />
			<TimeSettingItem
				label={localization.timeForChoosingFinalTheme}
				value={props.settings.timeForChoosingFinalTheme}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForChoosingFinalTheme', value)} />
			<TimeSettingItem
				label={localization.timeForFinalThinking}
				value={props.settings.timeForFinalThinking}
				maximum={120}
				onValueChanged={value => props.onTimeSettingChanged('timeForFinalThinking', value)} />
			<TimeSettingItem
				label={localization.timeForShowmanDecisions}
				value={props.settings.timeForShowmanDecisions}
				maximum={300}
				onValueChanged={value => props.onTimeSettingChanged('timeForShowmanDecisions', value)} />
			<TimeSettingItem
				label={localization.timeForMediaDelay}
				value={props.settings.timeForMediaDelay}
				maximum={10}
				onValueChanged={value => props.onTimeSettingChanged('timeForMediaDelay', value)} />
			<TimeSettingItem
				label={localization.timeForBlockingButton}
				value={props.settings.timeForBlockingButton}
				maximum={10}
				onValueChanged={value => props.onTimeSettingChanged('timeForBlockingButton', value)} />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeSettingsView);

