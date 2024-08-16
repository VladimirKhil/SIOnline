import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import GameType from '../../model/GameType';
import gameActionCreators from '../../state/game/gameActionCreators';
import ButtonPressMode from '../../model/ButtonPressMode';
import { useAppDispatch, useAppSelector } from '../../state/new/hooks';

import { setAllowEveryoneToPlayHiddenStakes,
	setButtonPressMode,
	setDisplayAnswerOptionsLabels,
	setDisplayAnswerOptionsOneByOne,
	setDisplaySources,
	setFalseStarts,
	setHintShowman,
	setIgnoreWrong,
	setManaged,
	setOral,
	setOralPlayersActions,
	setPartialImages,
	setPartialText,
	setPlayAllQuestionsInFinalRound,
	setPreloadRoundContent,
	setReadingSpeed,
	setUseApellations } from '../../state/new/settingsSlice';

import './RulesSettingsView.css';

interface RulesSettingsViewProps {
	gameType: GameType;
	onGameTypeChanged: (newGameType: number) => void;
}

const mapStateToProps = (state: State) => ({
	gameType: state.game.type,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onGameTypeChanged: (newGameType: number) => {
		dispatch(gameActionCreators.gameTypeChanged(newGameType));
	},
});

export function RulesSettingsView(props: RulesSettingsViewProps): JSX.Element {
	const settings = useAppSelector(state => state.settings);
	const appDispatch = useAppDispatch();

	function onReadingSpeedChanged(e: React.ChangeEvent<HTMLInputElement>) {
		const value = parseInt(e.target.value, 10);

		if (value > 0 && value <= 100) {
			appDispatch(setReadingSpeed(value));
		}
	}

	function onGameTypeChanged(e: React.ChangeEvent<HTMLSelectElement>) {
		props.onGameTypeChanged(parseInt(e.target.value, 10));
	}

	function onButtonPressModeChanged(e: React.ChangeEvent<HTMLSelectElement>) {
		appDispatch(setButtonPressMode(parseInt(e.target.value, 10)));
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
					checked={settings.appSettings.playAllQuestionsInFinalRound}
					disabled={props.gameType === GameType.Simple}
					onChange={() => appDispatch(setPlayAllQuestionsInFinalRound(!settings.appSettings.playAllQuestionsInFinalRound))}
				/>

				<label htmlFor="playAllQuestionsInFinalRound">{localization.playAllQuestionsInFinalRound}</label>
			</div>

			<div className="settingItem">
				<input
					id="oral"
					type="checkbox"
					checked={settings.appSettings.oral}
					onChange={() => appDispatch(setOral(!settings.appSettings.oral))}
				/>

				<label htmlFor="oral">{localization.oralGame}</label>
				<span className="hint">{localization.oralGameHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="oralPlayersActions"
					type="checkbox"
					disabled={!settings.appSettings.oral}
					checked={settings.appSettings.oralPlayersActions}
					onChange={() => appDispatch(setOralPlayersActions(!settings.appSettings.oralPlayersActions))}
				/>

				<label htmlFor="oralPlayersActions">{localization.oralPlayersActions}</label>
			</div>

			<div className="settingItem">
				<input
					id="falseStarts"
					type="checkbox"
					checked={settings.appSettings.falseStart}
					onChange={() => appDispatch(setFalseStarts(!settings.appSettings.falseStart))}
				/>

				<label htmlFor="falseStarts">{localization.falseStarts}</label>
				<span className="hint">{localization.falseStartsHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="partialText"
					type="checkbox"
					disabled={settings.appSettings.falseStart}
					checked={settings.appSettings.partialText}
					onChange={() => appDispatch(setPartialText(!settings.appSettings.partialText))}
				/>

				<label htmlFor="partialText">{localization.partialText}</label>
				<span className="hint">{localization.partialTextHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="partialImages"
					type="checkbox"
					disabled={settings.appSettings.falseStart}
					checked={settings.appSettings.partialImages}
					onChange={() => appDispatch(setPartialImages(!settings.appSettings.partialImages))}
				/>

				<label htmlFor="partialImages">{localization.partialImages}</label>
				<span className="hint">{localization.partialImagesHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="allowEveryoneToPlayHiddenStakes"
					type="checkbox"
					checked={settings.appSettings.allowEveryoneToPlayHiddenStakes}
					onChange={() => appDispatch(setAllowEveryoneToPlayHiddenStakes(!settings.appSettings.allowEveryoneToPlayHiddenStakes))}
				/>

				<label htmlFor="allowEveryoneToPlayHiddenStakes">{localization.allowEveryoneToPlayHiddenStakes}</label>
				<span className="hint">{localization.allowEveryoneToPlayHiddenStakesHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="hintShowman"
					type="checkbox"
					checked={settings.appSettings.hintShowman}
					onChange={() => appDispatch(setHintShowman(!settings.appSettings.hintShowman))}
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
						value={settings.appSettings.readingSpeed}
						min={1}
						max={100}
						onChange={onReadingSpeedChanged}
					/>

					<input
						aria-label="Reading speed value"
						className="valueEditor"
						type="number"
						value={settings.appSettings.readingSpeed}
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
					checked={settings.appSettings.managed}
					onChange={() => appDispatch(setManaged(!settings.appSettings.managed))}
				/>

				<label htmlFor="managed">{localization.managed}</label>
				<span className="hint">{localization.managedHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="useApellations"
					type="checkbox"
					checked={settings.appSettings.useApellations}
					onChange={() => appDispatch(setUseApellations(!settings.appSettings.useApellations))}
				/>

				<label htmlFor="useApellations">{localization.useApellations}</label>
				<span className="hint">{localization.useApellationsHint}</span>
			</div>

			<div className="settingItem">
				<input
					id="displayAnswerOptionsOneByOne"
					type="checkbox"
					checked={settings.appSettings.displayAnswerOptionsOneByOne}
					onChange={() => appDispatch(setDisplayAnswerOptionsOneByOne(!settings.appSettings.displayAnswerOptionsOneByOne))}
				/>

				<label htmlFor="displayAnswerOptionsOneByOne">{localization.displayAnswerOptionsOneByOne}</label>
			</div>

			<div className="settingItem">
				<input
					id="displayAnswerOptionsLabels"
					type="checkbox"
					checked={settings.appSettings.displayAnswerOptionsLabels}
					onChange={() => appDispatch(setDisplayAnswerOptionsLabels(!settings.appSettings.displayAnswerOptionsLabels))}
				/>

				<label htmlFor="displayAnswerOptionsLabels">{localization.displayAnswerOptionsLabels}</label>
			</div>

			<div className="settingItem">
				<input
					id="ignoreWrong"
					type="checkbox"
					checked={settings.appSettings.ignoreWrong}
					onChange={() => appDispatch(setIgnoreWrong(!settings.appSettings.ignoreWrong))}
				/>
				<label htmlFor="ignoreWrong">{localization.ignoreWrong}</label>
			</div>

			<div className="settingItem">
				<p className='gameTypeHeader'>{localization.buttonPressMode}</p>

				<select
					aria-label='Game type'
					className='gameType'
					value={settings.appSettings.buttonPressMode}
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
					checked={settings.appSettings.preloadRoundContent}
					onChange={() => appDispatch(setPreloadRoundContent(!settings.appSettings.preloadRoundContent))}
				/>
				<label htmlFor="preloadRoundContent">{localization.preloadRoundContent}</label>
			</div>

			<div className="settingItem">
				<input
					id="displaySources"
					type="checkbox"
					checked={settings.appSettings.displaySources}
					onChange={() => appDispatch(setDisplaySources(!settings.appSettings.displaySources))}
				/>
				<label htmlFor="displaySources">{localization.displaySources}</label>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(RulesSettingsView);

