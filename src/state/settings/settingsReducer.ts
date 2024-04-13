import SettingsState, { initialState } from './SettingsState';
import { AnyAction, Reducer } from 'redux';
import { KnownSettingsAction, SettingsActionTypes } from './SettingsActions';

const settingsReducer: Reducer<SettingsState> = (
	state: SettingsState = initialState,
	anyAction: AnyAction
): SettingsState => {
	const action = anyAction as KnownSettingsAction;

	switch (action.type) {
		case SettingsActionTypes.SoundVolumeChanged:
			return {
				...state,
				soundVolume: action.volume
			};

		case SettingsActionTypes.SoundChanged:
			return {
				...state,
				sound: action.sound
			};

		case SettingsActionTypes.AppSoundChanged:
			return {
				...state,
				appSound: action.sound
			};

		case SettingsActionTypes.MainMenusSoundChanged:
			return {
				...state,
				mainMenuSound: action.sound
			};

		case SettingsActionTypes.ShowPersonsAtBottomOnWideScreenChanged:
			return {
				...state,
				showPersonsAtBottomOnWideScreen: action.showPersonsAtBottomOnWideScreen
			};

		case SettingsActionTypes.SexChanged:
			return {
				...state,
				sex: action.newSex
			};

		case SettingsActionTypes.AvatarKeyChanged:
			return {
				...state,
				avatarKey: action.avatarKey
			};

		case SettingsActionTypes.OralChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					oral: action.oral
				}
			};

		case SettingsActionTypes.FalseStartsChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					falseStart: action.falseStarts
				}
			};

		case SettingsActionTypes.HintShowmanChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					hintShowman: action.hintShowman
				}
			};

		case SettingsActionTypes.PartialTextChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					partialText: action.partialText
				}
			};

		case SettingsActionTypes.ReadingSpeedChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					readingSpeed: action.readingSpeed
				}
			};

		case SettingsActionTypes.ManagedChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					managed: action.managed
				}
			};

		case SettingsActionTypes.UseApellationsChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					useApellations: action.useApellations
				}
			};

		case SettingsActionTypes.IgnoreWrongChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					ignoreWrong: action.ignoreWrong
				}
			};

		case SettingsActionTypes.UsePingPenaltyChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					usePingPenalty: action.usePingPenalty
				}
			};

		case SettingsActionTypes.ButtonPressModeChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					buttonPressMode: action.buttonPressMode
				}
			};

		case SettingsActionTypes.PreloadRoundContentChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					preloadRoundContent: action.preloadRoundContent
				}
			};

		case SettingsActionTypes.TimeSettingChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					timeSettings: {
						...state.appSettings.timeSettings,
						[action.name]: action.value
					}
				}
			};

		case SettingsActionTypes.LanguageChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					culture: action.language
				}
			};

		case SettingsActionTypes.GameButtonKeyChanged:
			return {
				...state,
				gameButtonKey: action.gameButtonKey
			};

		case SettingsActionTypes.LobbyChatVisibilityChanged:
			return {
				...state,
				isLobbyChatHidden: !action.isLobbyChatVisible
			};

		case SettingsActionTypes.ValidationAnswersVisibilityChanged:
			return {
				...state,
				areValidationAnswersHidden: !action.validationAnswersVisible
			};

		case SettingsActionTypes.PlayAllQuestionsInFinalRoundChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					playAllQuestionsInFinalRound: action.playAllQuestionsInFinalRound
				}
			};

		case SettingsActionTypes.OralPlayersActionsChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					oralPlayersActions: action.oralPlayersActions
				}
			};

		case SettingsActionTypes.AllowEveryoneToPlayHiddenStakesChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					allowEveryoneToPlayHiddenStakes: action.allowEveryoneToPlayHiddenStakes
				}
			};

		case SettingsActionTypes.DisplaySourcesChanged:
			return {
				...state,
				appSettings: {
					...state.appSettings,
					displaySources: action.displaySources
				}
			};

		case SettingsActionTypes.FloatingControlsChanged:
			return {
				...state,
				floatingControls: action.float,
			};

		case SettingsActionTypes.BindNextButtonChanged:
			return {
				...state,
				bindNextButton: action.bindNextButton,
			};

		case SettingsActionTypes.AttachContentToTableChanged:
			return {
				...state,
				attachContentToTable: action.attachContentToTable,
			};

		case SettingsActionTypes.ShowVideoAvatarsChanged:
			return {
				...state,
				showVideoAvatars: action.showVideoAvatars,
			};

		case SettingsActionTypes.ResetSettings:
			return initialState;

		default:
			return state;
	}
};

export default settingsReducer;
