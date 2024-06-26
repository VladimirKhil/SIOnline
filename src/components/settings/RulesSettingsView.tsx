import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import SettingsState from '../../state/settings/SettingsState';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import GameType from '../../model/GameType';
import gameActionCreators from '../../state/game/gameActionCreators';
import ButtonPressMode from '../../model/ButtonPressMode';

import './RulesSettingsView.css';

interface RulesSettingsViewProps {
	settings: SettingsState;
	gameType: GameType;

	onPlayAllQuestionsInFinalRoundChanged: (playAllQuestionsInFinalRound: boolean) => void;
	onOralChanged: (oral: boolean) => void;
	onOralPlayersActionsChanged: (oralPlayersActions: boolean) => void;
	onFalseStartsChanged: (falseStarts: boolean) => void;
	onHintShowmanChanged: (hintShowman: boolean) => void;
	onReadingSpeedChanged: (readingSpeed: number) => void;
	onManagedChanged: (managed: boolean) => void;
	onUseApellationsChanged: (useApellations: boolean) => void;
	onIgnoreWrongChanged: (ignoreWrong: boolean) => void;
	onPreloadRoundContentChanged: (preloadRoundContent: boolean) => void;
	onUsePingPenaltyChanged: (usePingPenalty: boolean) => void;
	onButtonPressModeChanged: (buttonPressMode: number) => void;
	onPartialTextChanged: (partialText: boolean) => void;
	onPartialImagesChanged: (partialImages: boolean) => void;
	onAllowEveryoneToPlayHiddenStakesChanged: (allowEveryoneToPlayHiddenStakes: boolean) => void;
	onDisplaySourcesChanged: (displaySources: boolean) => void;
	onGameTypeChanged: (newGameType: number) => void;
	onDisplayAnswerOptionsOneByOneChanged: (displayAnswerOptionsOneByOne: boolean) => void;
	onDisplayAnswerOptionsLabelsChanged: (displayAnswerOptionsLabels: boolean) => void;
}

const mapStateToProps = (state: State) => ({
	settings: state.settings,
	gameType: state.game.type,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPlayAllQuestionsInFinalRoundChanged: (playAllQuestionsInFinalRound: boolean) => {
		dispatch(settingsActionCreators.onPlayAllQuestionsInFinalRoundChanged(playAllQuestionsInFinalRound));
	},
	onOralChanged: (oral: boolean) => {
		dispatch(settingsActionCreators.onOralChanged(oral));
	},
	onOralPlayersActionsChanged: (oralPlayersActions: boolean) => {
		dispatch(settingsActionCreators.onOralPlayersActionsChanged(oralPlayersActions));
	},
	onFalseStartsChanged: (falseStarts: boolean) => {
		dispatch(settingsActionCreators.onFalseStartsChanged(falseStarts));
	},
	onHintShowmanChanged: (hintShowman: boolean) => {
		dispatch(settingsActionCreators.onHintShowmanChanged(hintShowman));
	},
	onReadingSpeedChanged: (readingSpeed: number) => {
		dispatch(settingsActionCreators.onReadingSpeedChanged(readingSpeed));
	},
	onManagedChanged: (managed: boolean) => {
		dispatch(settingsActionCreators.onManagedChanged(managed));
	},
	onUseApellationsChanged: (useApellations: boolean) => {
		dispatch(settingsActionCreators.onUseApellationsChanged(useApellations));
	},
	onIgnoreWrongChanged: (ignoreWrong: boolean) => {
		dispatch(settingsActionCreators.onIgnoreWrongChanged(ignoreWrong));
	},
	onUsePingPenaltyChanged: (usePingPenalty: boolean) => {
		dispatch(settingsActionCreators.onUsePingPenaltyChanged(usePingPenalty));
	},
	onButtonPressModeChanged: (buttonPressMode: number) => {
		dispatch(settingsActionCreators.onButtonPressModeChanged(buttonPressMode));
	},
	onPreloadRoundContentChanged: (preloadRoundContent: boolean) => {
		dispatch(settingsActionCreators.onPreloadRoundContentChanged(preloadRoundContent));
	},
	onPartialTextChanged: (partialText: boolean) => {
		dispatch(settingsActionCreators.onPartialTextChanged(partialText));
	},
	onPartialImagesChanged: (partialImages: boolean) => {
		dispatch(settingsActionCreators.onPartialImagesChanged(partialImages));
	},
	onAllowEveryoneToPlayHiddenStakesChanged: (allowEveryoneToPlayHiddenStakes: boolean) => {
		dispatch(settingsActionCreators.onAllowEveryoneToPlayHiddenStakesChanged(allowEveryoneToPlayHiddenStakes));
	},
	onDisplaySourcesChanged: (displaySources: boolean) => {
		dispatch(settingsActionCreators.onDisplaySourcesChanged(displaySources));
	},
	onGameTypeChanged: (newGameType: number) => {
		dispatch(gameActionCreators.gameTypeChanged(newGameType));
	},
	onDisplayAnswerOptionsOneByOneChanged: (displayAnswerOptionsOneByOne: boolean) => {
		dispatch(settingsActionCreators.onDisplayAnswerOptionsOneByOneChanged(displayAnswerOptionsOneByOne));
	},
	onDisplayAnswerOptionsLabelsChanged: (displayAnswerOptionsLabels: boolean) => {
		dispatch(settingsActionCreators.onDisplayAnswerOptionsLabelsChanged(displayAnswerOptionsLabels));
	},
});

export function RulesSettingsView(props: RulesSettingsViewProps): JSX.Element {
	function onReadingSpeedChanged(e: React.ChangeEvent<HTMLInputElement>) {
		const value = parseInt(e.target.value, 10);

		if (value > 0 && value <= 100) {
			props.onReadingSpeedChanged(value);
		}
	}

	function onGameTypeChanged(e: React.ChangeEvent<HTMLSelectElement>) {
		props.onGameTypeChanged(parseInt(e.target.value, 10));
	}

	function onButtonPressModeChanged(e: React.ChangeEvent<HTMLSelectElement>) {
		props.onButtonPressModeChanged(parseInt(e.target.value, 10));
	}

	return (
		<div>
			<div className="settingItem">
				<p className='gameTypeHeader'>{localization.gameType}</p>

				<select aria-label='Game type' className='gameType' value={props.gameType} onChange={onGameTypeChanged}>
					<option value="1">{localization.sport}</option>
					<option value="0">{localization.tv}</option>
				</select>

				<span className='gameTypeHint'>
					{props.gameType === GameType.Classic ? localization.gameTypeClassicHint : localization.gameTypeSimpleHint}
				</span>
			</div>

			<div className="settingItem">
				<input
					id="playAllQuestionsInFinalRound"
					type="checkbox"
					checked={props.settings.appSettings.playAllQuestionsInFinalRound}
					disabled={props.gameType === GameType.Simple}
					onChange={() => props.onPlayAllQuestionsInFinalRoundChanged(!props.settings.appSettings.playAllQuestionsInFinalRound)}
				/>

				<label htmlFor="playAllQuestionsInFinalRound">{localization.playAllQuestionsInFinalRound}</label>
			</div>

			<div className="settingItem">
				<input
					id="oral"
					type="checkbox"
					checked={props.settings.appSettings.oral}
					onChange={() => props.onOralChanged(!props.settings.appSettings.oral)}
				/>

				<label htmlFor="oral">{localization.oralGame}</label>
				<span className="hint">{localization.oralGameHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="oralPlayersActions"
					type="checkbox"
					disabled={!props.settings.appSettings.oral}
					checked={props.settings.appSettings.oralPlayersActions}
					onChange={() => props.onOralPlayersActionsChanged(!props.settings.appSettings.oralPlayersActions)}
				/>

				<label htmlFor="oralPlayersActions">{localization.oralPlayersActions}</label>
			</div>

			<div className="settingItem">
				<input
					id="falseStarts"
					type="checkbox"
					checked={props.settings.appSettings.falseStart}
					onChange={() => props.onFalseStartsChanged(!props.settings.appSettings.falseStart)}
				/>

				<label htmlFor="falseStarts">{localization.falseStarts}</label>
				<span className="hint">{localization.falseStartsHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="partialText"
					type="checkbox"
					disabled={props.settings.appSettings.falseStart}
					checked={props.settings.appSettings.partialText}
					onChange={() => props.onPartialTextChanged(!props.settings.appSettings.partialText)}
				/>

				<label htmlFor="partialText">{localization.partialText}</label>
				<span className="hint">{localization.partialTextHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="partialImages"
					type="checkbox"
					disabled={props.settings.appSettings.falseStart}
					checked={props.settings.appSettings.partialImages}
					onChange={() => props.onPartialImagesChanged(!props.settings.appSettings.partialImages)}
				/>

				<label htmlFor="partialImages">{localization.partialImages}</label>
				<span className="hint">{localization.partialImagesHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="allowEveryoneToPlayHiddenStakes"
					type="checkbox"
					checked={props.settings.appSettings.allowEveryoneToPlayHiddenStakes}
					onChange={() => props.onAllowEveryoneToPlayHiddenStakesChanged(!props.settings.appSettings.allowEveryoneToPlayHiddenStakes)}
				/>

				<label htmlFor="allowEveryoneToPlayHiddenStakes">{localization.allowEveryoneToPlayHiddenStakes}</label>
				<span className="hint">{localization.allowEveryoneToPlayHiddenStakesHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="hintShowman"
					type="checkbox"
					checked={props.settings.appSettings.hintShowman}
					onChange={() => props.onHintShowmanChanged(!props.settings.appSettings.hintShowman)}
				/>

				<label htmlFor="hintShowman">{localization.hintShowman}</label>
			</div>

			<p className="readingSpeed">{localization.questionReadingSpeed}</p>

			<div className="settingItem">
				<div>
					<input
						id='readingSpeed'
						aria-label="Reading speed range"
						className="rangeEditor"
						type="range"
						value={props.settings.appSettings.readingSpeed}
						min={1}
						max={100}
						onChange={onReadingSpeedChanged}
					/>

					<input
						aria-label="Reading speed value"
						className="valueEditor"
						type="number"
						value={props.settings.appSettings.readingSpeed}
						min={1}
						max={100}
						onChange={onReadingSpeedChanged}
					/>
				</div>
			</div>

			<div className="settingItem">
				<input
					id="managed"
					type="checkbox"
					checked={props.settings.appSettings.managed}
					onChange={() => props.onManagedChanged(!props.settings.appSettings.managed)}
				/>

				<label htmlFor="managed">{localization.managed}</label>
				<span className="hint">{localization.managedHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="useApellations"
					type="checkbox"
					checked={props.settings.appSettings.useApellations}
					onChange={() => props.onUseApellationsChanged(!props.settings.appSettings.useApellations)}
				/>

				<label htmlFor="useApellations">{localization.useApellations}</label>
				<span className="hint">{localization.useApellationsHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="displayAnswerOptionsOneByOne"
					type="checkbox"
					checked={props.settings.appSettings.displayAnswerOptionsOneByOne}
					onChange={() => props.onDisplayAnswerOptionsOneByOneChanged(!props.settings.appSettings.displayAnswerOptionsOneByOne)}
				/>

				<label htmlFor="displayAnswerOptionsOneByOne">{localization.displayAnswerOptionsOneByOne}</label>
			</div>

			<div className="settingItem">
				<input
					id="displayAnswerOptionsLabels"
					type="checkbox"
					checked={props.settings.appSettings.displayAnswerOptionsLabels}
					onChange={() => props.onDisplayAnswerOptionsLabelsChanged(!props.settings.appSettings.displayAnswerOptionsLabels)}
				/>

				<label htmlFor="displayAnswerOptionsLabels">{localization.displayAnswerOptionsLabels}</label>
			</div>

			<div className="settingItem">
				<input
					id="ignoreWrong"
					type="checkbox"
					checked={props.settings.appSettings.ignoreWrong}
					onChange={() => props.onIgnoreWrongChanged(!props.settings.appSettings.ignoreWrong)}
				/>
				<label htmlFor="ignoreWrong">{localization.ignoreWrong}</label>
			</div>

			<div className="settingItem">
				<p className='gameTypeHeader'>{localization.buttonPressMode}</p>

				<select
					aria-label='Game type'
					className='gameType'
					value={props.settings.appSettings.buttonPressMode}
					onChange={onButtonPressModeChanged}>
					<option value={ButtonPressMode.RandomWithinInterval}>{localization.buttonPressModeRandomWithinInterval}</option>
					<option value={ButtonPressMode.FirstWins}>{localization.buttonPressModeFirstWins}</option>
					<option value={ButtonPressMode.FirstWinsClient}>{localization.buttonPressModeFirstWinsClient}</option>
				</select>
			</div>

			<div className="settingItem">
				<input
					id="preloadRoundContent"
					type="checkbox"
					checked={props.settings.appSettings.preloadRoundContent}
					onChange={() => props.onPreloadRoundContentChanged(!props.settings.appSettings.preloadRoundContent)}
				/>
				<label htmlFor="preloadRoundContent">{localization.preloadRoundContent}</label>
			</div>

			<div className="settingItem">
				<input
					id="displaySources"
					type="checkbox"
					checked={props.settings.appSettings.displaySources}
					onChange={() => props.onDisplaySourcesChanged(!props.settings.appSettings.displaySources)}
				/>
				<label htmlFor="displaySources">{localization.displaySources}</label>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(RulesSettingsView);

