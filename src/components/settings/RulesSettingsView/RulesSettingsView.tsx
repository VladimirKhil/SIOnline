import * as React from 'react';
import localization from '../../../model/resources/localization';
import GameType from '../../../model/GameType';
import ButtonPressMode from '../../../model/ButtonPressMode';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';

import { resetSettings,
	setAllowEveryoneToPlayHiddenStakes,
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
	setUseApellations } from '../../../state/new/settingsSlice';

import { setType } from '../../../state/new/gameSlice';

import './RulesSettingsView.css';

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

	return (
		<div className='rulesSettingsView'>
			<div className="block">
				<div className='blockName'>{localization.gameType}</div>

				<div className='blockValue'>
					<select aria-label='Game type' className='blockValue' value={game.type} onChange={onGameTypeChanged}>
						<option value="1">{localization.sport}</option>
						<option value="0">{localization.tv}</option>
					</select>

					<div className='hint gameTypeHint'>
						{game.type === GameType.Classic ? localization.gameTypeClassicHint : localization.gameTypeSimpleHint}
					</div>

					<div className='hint gameTypeHint'>
						{localization.gameTypeFinalHint}
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
				<label className='blockName' htmlFor="ignoreWrong">{localization.ignoreWrong}</label>

				<div className='blockValue'>
					<input
						id="ignoreWrong"
						type="checkbox"
						checked={!settings.appSettings.ignoreWrong}
						onChange={() => appDispatch(setIgnoreWrong(!settings.appSettings.ignoreWrong))}
					/>
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

			<div className='headerBlock'>{localization.question}: {localization.withStakeForAll}</div>

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

			<div className="block">
				<label className='blockName' htmlFor="displaySources">{localization.displaySources}</label>

				<div className='blockValue'>
					<input
						id="displaySources"
						type="checkbox"
						checked={settings.appSettings.displaySources}
						onChange={() => appDispatch(setDisplaySources(!settings.appSettings.displaySources))}
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

