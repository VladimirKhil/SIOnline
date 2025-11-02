import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setCustomSound } from '../../../state/settingsSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import GameSound from '../../../model/enums/GameSound';
import Constants from '../../../model/enums/Constants';

import './SoundsSettingsView.scss';

const MaxAudioSizeMb = 1;

// Map GameSound enum values to display names
const soundDisplayNames: Record<GameSound, keyof typeof localization> = {
	[GameSound.ANSWER_WRONG]: 'soundAnswerWrong',
	[GameSound.APPLAUSE_BIG]: 'soundApplauseBig',
	[GameSound.APPLAUSE_FINAL]: 'soundApplauseFinal',
	[GameSound.APPLAUSE_SMALL]: 'soundApplauseSmall',
	[GameSound.FINAL_DELETE]: 'soundFinalDelete',
	[GameSound.FINAL_THINK]: 'soundFinalThink',
	[GameSound.MAIN_MENU]: 'soundMainMenu',
	[GameSound.QUESTION_FOR_ALL]: 'soundQuestionAll',
	[GameSound.QUESTION_NOANSWERS]: 'soundQuestionNoAnswers',
	[GameSound.QUESTION_FOR_YOURSELF]: 'soundQuestionForYourself',
	[GameSound.QUESTION_SECRET]: 'soundQuestionSecret',
	[GameSound.QUESTION_STAKE]: 'soundQuestionStake',
	[GameSound.QUESTION_FOR_ALL_WITH_STAKE]: 'soundQuestionStakeAll',
	[GameSound.ROUND_BEGIN]: 'soundRoundBegin',
	[GameSound.ROUND_THEMES]: 'soundRoundThemes',
	[GameSound.ROUND_TIMEOUT]: 'soundRoundTimeout',
	// These sounds don't have default files, but are part of the enum
	[GameSound.BUTTON_PRESSED]: 'soundAnswerWrong', // Using wrong answer as fallback
	[GameSound.GAME_THEMES]: 'soundRoundThemes', // Using round themes as fallback
	[GameSound.QUESTION_SELECTED]: 'soundQuestionAll', // Using question all as fallback
};

// Get the custom sound key for localStorage
function getCustomSoundKey(sound: GameSound): string {
	return `${Constants.CUSTOM_SOUNDS_PREFIX}${sound}`;
}

// Get the custom sound name key for localStorage
function getCustomSoundNameKey(sound: GameSound): string {
	return `${Constants.CUSTOM_SOUNDS_PREFIX}${sound}_name`;
}

// Render custom sound preview if available
function renderCustomSoundPreview(sound: GameSound) {
	const customSoundKey = getCustomSoundKey(sound);
	const customSoundNameKey = getCustomSoundNameKey(sound);
	const base64 = localStorage.getItem(customSoundKey);
	const fileName = localStorage.getItem(customSoundNameKey);

	if (!base64) {
		return null;
	}

	return (
		<div className='customSoundPreview'>
			<audio controls src={`data:audio/mp3;base64,${base64}`} />
			<span className='fileName'>{fileName}</span>
		</div>
	);
}

const SoundsSettingsView: React.FC = () => {
	const customSounds = useAppSelector(state => state.settings.customSounds);
	const appDispatch = useAppDispatch();

	function onCustomSoundChanged(sound: GameSound, e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			// eslint-disable-next-line prefer-destructuring
			const targetFile = e.target.files[0];

			if (targetFile.size > MaxAudioSizeMb * 1024 * 1024) {
				appDispatch(userErrorChanged(`${localization.fileIsTooBig} (${MaxAudioSizeMb} MB)`));
				return;
			}

			const reader = new FileReader();
			reader.onload = () => {
				if (reader.result && typeof reader.result === 'string') {
					const [, base64] = reader.result.split(','); // Remove data:audio/mp3;base64, prefix
					const customSoundKey = getCustomSoundKey(sound);
					const customSoundNameKey = getCustomSoundNameKey(sound);

					// Store in localStorage
					localStorage.setItem(customSoundKey, base64);
					localStorage.setItem(customSoundNameKey, targetFile.name);

					// Update state to track that this sound has been customized
					appDispatch(setCustomSound({ soundKey: sound, value: customSoundKey }));
				}
			};
			reader.readAsDataURL(targetFile);
		}
	}

	function onCustomSoundDeleted(sound: GameSound) {
		const customSoundKey = getCustomSoundKey(sound);
		const customSoundNameKey = getCustomSoundNameKey(sound);

		// Remove from localStorage
		localStorage.removeItem(customSoundKey);
		localStorage.removeItem(customSoundNameKey);

		// Update state to remove customization
		appDispatch(setCustomSound({ soundKey: sound, value: null }));
	}

	// Filter out sounds that have files in the assets folder
	const availableSounds = [
		GameSound.MAIN_MENU,
		GameSound.ROUND_BEGIN,
		GameSound.ROUND_THEMES,
		GameSound.QUESTION_STAKE,
		GameSound.QUESTION_SECRET,
		GameSound.QUESTION_FOR_YOURSELF,
		GameSound.QUESTION_FOR_ALL,
		GameSound.QUESTION_FOR_ALL_WITH_STAKE,
		GameSound.FINAL_THINK,
		GameSound.ANSWER_WRONG,
		GameSound.QUESTION_NOANSWERS,
		GameSound.APPLAUSE_BIG,
		GameSound.APPLAUSE_FINAL,
		GameSound.APPLAUSE_SMALL,
		GameSound.FINAL_DELETE,
		GameSound.ROUND_TIMEOUT,
	];

	return (
		<div className='soundsSettingsView'>
			<div className='soundsList'>
				{availableSounds.map(sound => {
					const displayNameKey = soundDisplayNames[sound];
					const displayName = localization[displayNameKey] || sound;
					const isCustomized = customSounds[sound];

					return (
						<div key={sound} className='soundItem'>
							<div className='soundInfo'>
								<label className='soundLabel'>{displayName}</label>
								{isCustomized && renderCustomSoundPreview(sound)}
							</div>

							<div className='soundControls'>
								<input
									type="file"
									accept=".mp3,.wav,.ogg"
									aria-label={localization.soundsUpload}
									onChange={(e) => onCustomSoundChanged(sound, e)}
									className='customSoundSelector'
								/>

								{isCustomized && (
									<button
										type='button'
										className='standard delete'
										onClick={() => onCustomSoundDeleted(sound)}
										title={localization.soundsReset}>
										{localization.soundsReset}
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default SoundsSettingsView;