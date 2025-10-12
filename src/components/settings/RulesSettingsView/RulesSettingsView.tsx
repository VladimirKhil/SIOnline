import * as React from 'react';
import localization from '../../../model/resources/localization';
import GameType from '../../../model/GameType';
import ButtonPressMode from '../../../model/ButtonPressMode';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import { resetSettings,
	setAllowEveryoneToPlayHiddenStakes,
	setButtonPressMode,
	setDisplayAnswerOptionsLabels,
	setDisplayAnswerOptionsOneByOne,
	setFalseStarts,
	setHintShowman,
	setManaged,
	setOral,
	setOralPlayersActions,
	setPartialImages,
	setPartialText,
	setPlayAllQuestionsInFinalRound,
	setPreloadRoundContent,
	setQuestionForAllPenalty,
	setQuestionForYourselfFactor,
	setQuestionForYourselfPenalty,
	setQuestionWithButtonPenalty,
	setReadingSpeed,
	setUseApellations } from '../../../state/settingsSlice';

import { setType } from '../../../state/gameSlice';
import PenaltyType from '../../../model/enums/PenaltyType';

import './RulesSettingsView.scss';

export default function RulesSettingsView(): JSX.Element {
	const settings = useAppSelector(state => state.settings);
	const game = useAppSelector(state => state.game);
	const appDispatch = useAppDispatch();

	function onReadingSpeedChanged(e: React.ChangeEvent<HTMLInputElement>) {
		const value = parseInt(e.target.value, 10);

		if (value > 0 && value <= 100) {
			appDispatch(setReadingSpeed(value));
		}
	}

	function onGameTypeChanged(e: React.ChangeEvent<HTMLSelectElement>) {
		appDispatch(setType(parseInt(e.target.value, 10)));
	}

	function onButtonPressModeChanged(e: React.ChangeEvent<HTMLSelectElement>) {
		appDispatch(setButtonPressMode(parseInt(e.target.value, 10)));
	}

	function getGameTypeTableHint(): React.ReactNode {
		switch (game.type) {
			case GameType.Classic:
				return localization.gameTypeClassicTableHint;

			case GameType.Simple:
				return localization.gameTypeSimpleTableHint;

			case GameType.Quiz:
				return localization.gameTypeQuizTableHint;

			default:
				return localization.gameTypeTurnTakingTableHint;
		}
	}

	function getGameTypeThemeListHint(): React.ReactNode {
		switch (game.type) {
			case GameType.Classic:
				return localization.gameTypeClassicThemeListHint;

			case GameType.Simple:
				return localization.gameTypeSimpleThemeListHint;

			case GameType.Quiz:
				return localization.gameTypeQuizThemeListHint;

			default:
				return localization.gameTypeTurnTakingThemeListHint;
		}
	}

	return (
		<div className='rulesSettingsView'>
			<div className="block bigger">
				<div className='blockName'>{localization.gameType}</div>

				<div className='blockGameTypeBody'>
					<div className='blockGameTypeValue'>
						<select aria-label='Game type' className='blockValue gameType' value={game.type} onChange={onGameTypeChanged}>
							<option value="0">{localization.tv}</option>
							<option value="1">{localization.sport}</option>
							<option value="2">{localization.quiz}</option>
							<option value="3">{localization.turnTaking}</option>
						</select>

						{game.type === GameType.Classic ? (
							<div className='hint gameTypeHint'>
								{localization.gameTypeShowGameThemes}
							</div>
						) : null}

						<div className='hint gameTypeHint'>
							{getGameTypeTableHint()}
						</div>

						<div className='hint gameTypeHint'>
							{getGameTypeThemeListHint()}
						</div>
					</div>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor="oral">{localization.oralGame}</label>

				<div className='blockValue'>
					<input
						id="oral"
						type="checkbox"
						checked={settings.appSettings.oral}
						onChange={() => appDispatch(setOral(!settings.appSettings.oral))}
					/>

					<div className="hint">{localization.oralGameHint}</div>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor="oralPlayersActions">{localization.oralPlayersActions}</label>

				<div className='blockValue'>
					<input
						id="oralPlayersActions"
						type="checkbox"
						disabled={!settings.appSettings.oral}
						checked={settings.appSettings.oralPlayersActions}
						onChange={() => appDispatch(setOralPlayersActions(!settings.appSettings.oralPlayersActions))}
					/>
				</div>
			</div>

			<div className="block">
				<label htmlFor="managed" className='blockName'>{localization.managed}</label>

				<div className='blockValue'>
					<input
						id="managed"
						type="checkbox"
						checked={settings.appSettings.managed}
						onChange={() => appDispatch(setManaged(!settings.appSettings.managed))}
					/>

					<div className="hint">{localization.managedHint}</div>
				</div>
			</div>

			<div className='headerBlock'>{localization.round}: {localization.final}</div>

			<div className="block">
				<label className='blockName' htmlFor="playAllQuestionsInFinalRound">{localization.playAllQuestionsInFinalRound}</label>

				<div className='blockValue'>
					<input
						id="playAllQuestionsInFinalRound"
						type="checkbox"
						checked={settings.appSettings.playAllQuestionsInFinalRound}
						onChange={() => appDispatch(setPlayAllQuestionsInFinalRound(!settings.appSettings.playAllQuestionsInFinalRound))}
					/>
				</div>
			</div>

			<div className='headerBlock'>{localization.question}: {localization.withButton}</div>

			<div className="block">
				<label className='blockName' htmlFor="falseStarts">{localization.falseStarts}</label>

				<div className='blockValue'>
					<input
						id="falseStarts"
						type="checkbox"
						checked={settings.appSettings.falseStart}
						onChange={() => appDispatch(setFalseStarts(!settings.appSettings.falseStart))}
					/>

					<div className="hint">{localization.falseStartsHint}</div>
				</div>
			</div>

			<div className='block'>
				<label className='blockName' htmlFor="partialText">{localization.partialText}</label>

				<div className='blockValue'>
					<input
						id="partialText"
						type="checkbox"
						disabled={settings.appSettings.falseStart}
						checked={settings.appSettings.partialText}
						onChange={() => appDispatch(setPartialText(!settings.appSettings.partialText))}
					/>

					<div className="hint">{localization.partialTextHint}</div>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor='partialImages'>{localization.partialImages}</label>

				<div className='blockValue'>
					<input
						id="partialImages"
						type="checkbox"
						disabled={settings.appSettings.falseStart}
						checked={settings.appSettings.partialImages}
						onChange={() => appDispatch(setPartialImages(!settings.appSettings.partialImages))}
					/>

					<div className="hint">{localization.partialImagesHint}</div>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor="questionWithButtonPenalty">{localization.questionPenalty}</label>

				<div className='blockValue'>
					<select
						id="questionWithButtonPenalty"
						aria-label='Question with button penalty'
						className='blockValue'
						value={settings.appSettings.questionWithButtonPenalty}
						onChange={e => appDispatch(setQuestionWithButtonPenalty(parseInt(e.target.value, 10)))}>
						<option value={PenaltyType.None}>{localization.penaltyNone}</option>
						<option value={PenaltyType.SubtractPoints}>{localization.penaltySubtractPoints}</option>
					</select>
				</div>
			</div>

			<div className="block">
				<div className='blockName'>{localization.buttonPressMode}</div>

				<select
					aria-label='Game type'
					className='blockValue'
					value={settings.appSettings.buttonPressMode}
					onChange={onButtonPressModeChanged}>
					<option value={ButtonPressMode.RandomWithinInterval}>{localization.buttonPressModeRandomWithinInterval}</option>
					<option value={ButtonPressMode.FirstWins}>{localization.buttonPressModeFirstWins}</option>
					<option value={ButtonPressMode.FirstWinsClient}>{localization.buttonPressModeFirstWinsClient}</option>
				</select>
			</div>

			<div className='headerBlock'>{localization.question}: {localization.questionTypeForYourself}</div>

			<div className="block">
				<label className='blockName' htmlFor="questionForYourselfPenalty">{localization.questionPenalty}</label>

				<div className='blockValue'>
					<select
						id="questionForYourselfPenalty"
						aria-label='Question for yourself penalty'
						className='blockValue'
						value={settings.appSettings.questionForYourselfPenalty}
						onChange={e => appDispatch(setQuestionForYourselfPenalty(parseInt(e.target.value, 10)))}>
						<option value={PenaltyType.None}>{localization.penaltyNone}</option>
						<option value={PenaltyType.SubtractPoints}>{localization.penaltySubtractPoints}</option>
					</select>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor="questionForYourselfFactor">{localization.scoreFactor}</label>

				<div className='blockValue'>
					<input
						id="questionForYourselfFactor"
						type="number"
						className='blockValue'
						value={settings.appSettings.questionForYourselfFactor}
						min={1}
						max={10}
						onChange={e => appDispatch(setQuestionForYourselfFactor(parseInt(e.target.value, 10)))}
					/>
				</div>
			</div>

			<div className='headerBlock'>{localization.question}: {localization.questionTypeForAll}</div>

			<div className="block">
				<label className='blockName' htmlFor="questionForAllPenalty">{localization.questionPenalty}</label>

				<div className='blockValue'>
					<select
						id="questionForAllPenalty"
						aria-label='Question for all penalty'
						className='blockValue'
						value={settings.appSettings.questionForAllPenalty}
						onChange={e => appDispatch(setQuestionForAllPenalty(parseInt(e.target.value, 10)))}>
						<option value={PenaltyType.None}>{localization.penaltyNone}</option>
						<option value={PenaltyType.SubtractPoints}>{localization.penaltySubtractPoints}</option>
					</select>
				</div>
			</div>

			<div className='headerBlock'>{localization.question}: {localization.questionTypeForAllWithStake}</div>

			<div className="block">
				<label className='blockName' htmlFor="allowEveryoneToPlayHiddenStakes">{localization.allowEveryoneToPlayHiddenStakes}</label>

				<div className='blockValue'>
					<input
						id="allowEveryoneToPlayHiddenStakes"
						type="checkbox"
						checked={settings.appSettings.allowEveryoneToPlayHiddenStakes}
						onChange={() => appDispatch(setAllowEveryoneToPlayHiddenStakes(!settings.appSettings.allowEveryoneToPlayHiddenStakes))}
					/>

					<div className="hint">{localization.allowEveryoneToPlayHiddenStakesHint}</div>
				</div>
			</div>

			<div className='headerBlock'>{localization.other}</div>

			<div className="block">
				<label className='blockName' htmlFor="hintShowman">{localization.hintShowman}</label>

				<div className='blockValue'>
					<input
						id="hintShowman"
						type="checkbox"
						checked={settings.appSettings.hintShowman}
						onChange={() => appDispatch(setHintShowman(!settings.appSettings.hintShowman))}
					/>
				</div>
			</div>

			<div className="block">
				<div className="blockName">{localization.questionReadingSpeed}</div>

				<div className="blockValue">
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

					<span className="smallHint">{localization.symbolsPerSecond}</span>
				</div>
			</div>

			<div className='block'>
				<label className='blockName' htmlFor="useApellations">{localization.useApellations}</label>

				<div className='blockValue'>
					<input
						id="useApellations"
						type="checkbox"
						checked={settings.appSettings.useApellations}
						onChange={() => appDispatch(setUseApellations(!settings.appSettings.useApellations))}
					/>

					<div className="hint">{localization.useApellationsHint}</div>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor="displayAnswerOptionsOneByOne">{localization.displayAnswerOptionsOneByOne}</label>

				<div className='blockValue'>
					<input
						id="displayAnswerOptionsOneByOne"
						type="checkbox"
						checked={settings.appSettings.displayAnswerOptionsOneByOne}
						onChange={() => appDispatch(setDisplayAnswerOptionsOneByOne(!settings.appSettings.displayAnswerOptionsOneByOne))}
					/>
				</div>
			</div>

			<div className="block">
				<label className='blockName' htmlFor="displayAnswerOptionsLabels">{localization.displayAnswerOptionsLabels}</label>

				<div className='blockValue'>
					<input
						id="displayAnswerOptionsLabels"
						type="checkbox"
						checked={settings.appSettings.displayAnswerOptionsLabels}
						onChange={() => appDispatch(setDisplayAnswerOptionsLabels(!settings.appSettings.displayAnswerOptionsLabels))}
					/>
				</div>
			</div>

			<div className='block'>
				<label className='blockName' htmlFor="preloadRoundContent">{localization.preloadRoundContent}</label>

				<div className='blockValue'>
					<input
						id="preloadRoundContent"
						type="checkbox"
						checked={settings.appSettings.preloadRoundContent}
						onChange={() => appDispatch(setPreloadRoundContent(!settings.appSettings.preloadRoundContent))}
					/>
				</div>
			</div>

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

