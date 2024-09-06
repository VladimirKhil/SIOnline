import * as React from 'react';
import localization from '../../model/resources/localization';
import TimeSettingItem from './TimeSettingItem';
import TimeSettings from '../../model/TimeSettings';
import { useAppDispatch, useAppSelector } from '../../state/new/hooks';
import { resetSettings, setTimeSetting } from '../../state/new/settingsSlice';

import './TimeSettingsView.css';

export default function TimeSettingsView(): JSX.Element {
	const settings = useAppSelector(state => state.settings.appSettings.timeSettings);
	const appDispatch = useAppDispatch();

	function onTimeSettingChanged(name: keyof TimeSettings, value: number): void {
		appDispatch(setTimeSetting({ name, value }));
	}

	return (
		<div className="timeSettingsView">
			<TimeSettingItem
				label={localization.timeForChoosingQuestion}
				value={settings.timeForChoosingQuestion}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForChoosingQuestion', value)} />

			<TimeSettingItem
				label={localization.timeForThinkingOnQuestion}
				value={settings.timeForThinkingOnQuestion}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForThinkingOnQuestion', value)} />

			<TimeSettingItem
				label={localization.timeForPrintingAnswer}
				value={settings.timeForPrintingAnswer}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForPrintingAnswer', value)} />

			<TimeSettingItem
				label={localization.timeForGivingACat}
				value={settings.timeForGivingACat}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForGivingACat', value)} />

			<TimeSettingItem
				label={localization.timeForMakingStake}
				value={settings.timeForMakingStake}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForMakingStake', value)} />

			<TimeSettingItem
				label={localization.timeForThinkingOnSpecial}
				value={settings.timeForThinkingOnSpecial}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForThinkingOnSpecial', value)} />

			<TimeSettingItem
				label={localization.timeForRightAnswer}
				value={settings.timeForRightAnswer}
				maximum={10}
				onValueChanged={value => onTimeSettingChanged('timeForRightAnswer', value)} />

			<TimeSettingItem
				label={localization.timeOfRound}
				value={settings.timeOfRound}
				maximum={10800}
				onValueChanged={value => onTimeSettingChanged('timeOfRound', value)} />

			<TimeSettingItem
				label={localization.timeForChoosingFinalTheme}
				value={settings.timeForChoosingFinalTheme}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForChoosingFinalTheme', value)} />

			<TimeSettingItem
				label={localization.timeForFinalThinking}
				value={settings.timeForFinalThinking}
				maximum={120}
				onValueChanged={value => onTimeSettingChanged('timeForFinalThinking', value)} />

			<TimeSettingItem
				label={localization.timeForShowmanDecisions}
				value={settings.timeForShowmanDecisions}
				maximum={300}
				onValueChanged={value => onTimeSettingChanged('timeForShowmanDecisions', value)} />

			<TimeSettingItem
				label={localization.timeForMediaDelay}
				value={settings.timeForMediaDelay}
				maximum={10}
				onValueChanged={value => onTimeSettingChanged('timeForMediaDelay', value)} />

			<TimeSettingItem
				label={localization.timeForBlockingButton}
				value={settings.timeForBlockingButton}
				maximum={10}
				onValueChanged={value => onTimeSettingChanged('timeForBlockingButton', value)} />

			<TimeSettingItem
				label={localization.partialImageTime}
				value={settings.partialImageTime}
				maximum={20}
				onValueChanged={value => onTimeSettingChanged('partialImageTime', value)} />

			<button
				type="button"
				className="reset standard"
				title={localization.resetToDefaultsHint}
				onClick={() => appDispatch(resetSettings())}>
				{localization.resetToDefaults}
			</button>
		</div>
	);
}

