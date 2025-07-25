import { AnyAction, Dispatch } from 'redux';
import State from '../state/State';
import DataContext from '../model/DataContext';
import ContentGroup from '../model/ContentGroup';
import Constants from '../model/enums/Constants';
import ContentInfo from '../model/ContentInfo';
import ContentType from '../model/enums/ContentType';
import AnswerOption from '../model/AnswerOption';
import ItemState from '../model/enums/ItemState';
import LayoutMode from '../model/enums/LayoutMode';
import PlayerStates from '../model/enums/PlayerStates';
import roomActionCreators from '../state/room/roomActionCreators';
import MessageLevel from '../model/enums/MessageLevel';
import GameSound from '../model/enums/GameSound';
import ThemeInfo from '../model/ThemeInfo';
import GameStage from '../model/enums/GameStage';
import Account from '../model/Account';
import localization from '../model/resources/localization';
import ThemesPlayMode from '../model/enums/ThemesPlayMode';
import TableMode from '../model/enums/TableMode';
import Role from '../model/Role';
import Sex from '../model/enums/Sex';
import RoundRules from '../model/enums/RoundRules';
import { AppDispatch } from '../state/store';
import TimerStates from '../model/enums/TimeStates';
import PlayerStatistics from '../model/PlayerStatistics';

import { answerOptions,
	appendPartialText,
	blinkQuestion,
	blinkTheme,
	canPressChanged,
	captionChanged,
	clearActiveState,
	clearAudio,
	endQuestion,
	isSelectableChanged,
	pauseLoadTimer,
	prependTextChanged,
	questionReset,
	removeTheme,
	resumeLoadTimer,
	resumeMedia,
	rightOption,
	setAnswerView,
	setThemesComments,
	showBackgroundAudio,
	showContent,
	showContentHint,
	showGameThemes,
	showLogo,
	showObject,
	showPartialText,
	showQuestionType,
	showRoundTable,
	showRoundThemes,
	showStatistics,
	showText,
	startLoadTimer,
	switchToContent,
	updateOption,
	updateOptionState,
	updateQuestion } from '../state/tableSlice';

import {
	ContextView,
	DecisionType,
	activatePlayerDecision,
	activateShowmanDecision,
	askValidation,
	chooserChanged,
	clearDecisions,
	deselectPlayers,
	infoChanged,
	isReadyChanged,
	personAdded,
	personRemoved,
	personAvatarChanged,
	personAvatarVideoChanged,
	playerAdded,
	playerChanged,
	playerDeleted,
	playerInGameChanged,
	playerLostStateDropped,
	playerLostStatesDropped,
	playerMediaLoaded,
	playerMediaPreloaded,
	playerReplicChanged,
	playerRoundStateCleared,
	playerStateChanged,
	playerStatesChanged,
	playerSumChanged,
	playersAnswersChanged,
	playersStateCleared,
	playersSwap,
	questionAnswersChanged,
	selectPlayers,
	setContext,
	setHostName,
	setIsAppellation,
	setDecisionType,
	setIsGameStarted,
	setIsPaused,
	setReport,
	setRoomRole,
	setSettingDisplayAnswerOptionsLabels,
	setSettingFalseStart,
	setSettingManaged,
	setSettingOral,
	setSettingPartialImageTime,
	setSettingPartialImages,
	setSettingPartialText,
	setSettingReadingSpeed,
	setSettingTimeForBlockingButton,
	setSettingUseApellations,
	showmanChanged,
	showmanReplicChanged,
	stopValidation,
	sumsChanged,
	validate,
	setNoRiskMode,
	addToChat,
	setJoinMode,
	showMediaPreloadProgress,
} from '../state/room2Slice';

import PersonInfo from '../model/PersonInfo';
import Persons from '../model/Persons';
import PlayerInfo from '../model/PlayerInfo';
import actionCreators from './actionCreators';
import StakeModes from '../client/game/StakeModes';
import { playAudio, stopAudio, userInfoChanged, userWarnChanged } from '../state/commonSlice';
import getErrorMessage, { getUserError } from '../utils/ErrorHelpers';
import { playersVisibilityChanged, setQrCode } from '../state/uiSlice';
import ErrorCode from '../client/contracts/ErrorCode';
import { setAttachContentToTable } from '../state/settingsSlice';
import { addGameLog, appendGameLog, copyToClipboard } from '../state/globalActions';
import { mediaPreloaded, mediaPreloadProgress } from '../state/serverActions';
import stringFormat from '../utils/StringHelpers';
import JoinMode from '../client/game/JoinMode';

function initGroup(group: ContentGroup) {
	let bestRowCount = 1;
	let bestColumnCount = group.content.length / bestRowCount;
	let bestItemSize = Math.min(9.0 / bestRowCount, 16.0 / bestColumnCount);

	for	(let rowCount = 2; rowCount < group.content.length; rowCount++) {
		const columnCount = Math.ceil(group.content.length / rowCount);
		const itemSize = Math.min(9.0 / rowCount, 16.0 / columnCount);

		if (itemSize > bestItemSize) {
			bestItemSize = itemSize;
			bestRowCount = rowCount;
			bestColumnCount = columnCount;
		}
	}

	group.columnCount = bestColumnCount;
	group.weight *= bestRowCount;
}

function getRuleString(rules: string) {
	switch (rules) {
		case RoundRules.SelectByPlayer:
			return localization.rulesClassic;

		case RoundRules.Sequential:
			return localization.rulesSequential;

		case RoundRules.RemoveOtherThemes:
			return localization.rulesRemoveThemes;

		default:
			return '';
	}
}

function getAskSelectHint(reason: string): string {
	switch (reason) {
		case 'Answerer':
			return localization.selectAnswerer;

		case 'Chooser':
			return localization.selectFirstPlayer;

		case 'Deleter':
			return localization.selectThemeDeleter;

		case 'Staker':
			return localization.selectStaker;

		default:
			return '';
	}
}

export default class ClientController {
	constructor(
		private dispatch: Dispatch<AnyAction>,
		private appDispatch: AppDispatch,
		private getState: () => State,
		private dataContext: DataContext,
		private loadStart: Date | null = null,
	) {}

	preprocessServerUri(uri: string) {
		const result = uri.replace(
			'<SERVERHOST>',
			this.dataContext.contentUris && this.dataContext.contentUris.length > 0
				? this.dataContext.contentUris[0]
				: this.dataContext.serverUri
		);

		if (typeof location !== 'undefined' && location.protocol === 'https:') {
			return result.replace('http://', 'https://');
		}

		return result;
	}

	private playGameSound(sound: GameSound, loop = false): void {
		const isSoundEnabled = this.getState().settings.appSound;

		if (!isSoundEnabled) {
			return;
		}

		this.appDispatch(playAudio({ audio: sound, loop }));
	}

	private onScreenContent(content: ContentInfo[]) {
		const groups: ContentGroup[] = [];
		let group: ContentGroup | null = null;

		let runContentLoadTimer = false;
		const state = this.getState();

		for	(let i = 0; i < content.length; i++) {
			const { type, value } = content[i];

			switch (type) {
				case 'text':
					if (group) {
						groups.push(group);
						initGroup(group);
						group = null;
					}

					const textWeight = Math.min(Constants.LARGE_CONTENT_WEIGHT, Math.max(1, value.length / 80));
					const textGroup: ContentGroup = { weight: textWeight, content: [], columnCount: 1 };

					textGroup.content.push({
						type: ContentType.Text,
						value: value,
						read: groups.length === 0 && !state.table.isAnswer,
						partial: false,
					});

					groups.push(textGroup);

					if (state.settings.writeGameLog) {
						this.appDispatch(addGameLog(value));
					}

					break;

				case 'image':
					if (!group) {
						group = { weight: Constants.LARGE_CONTENT_WEIGHT, content: [], columnCount: 1 };
					}

					group.content.push({
						type: ContentType.Image,
						value: this.preprocessServerUri(value),
						read: false,
						partial: false,
					});

					// TODO: this logic should be moved to server
					if (state.room.stage.isQuestion &&
						state.room.stage.questionType === 'simple' &&
						!state.table.isAnswer &&
						!state.room2.settings.falseStart &&
						state.room2.settings.partialImages &&
						state.room2.settings.timeSettings.partialImageTime > 0) {
						runContentLoadTimer = true;
					}

					break;

				case 'video':
					if (!group) {
						group = { weight: Constants.LARGE_CONTENT_WEIGHT, content: [], columnCount: 1 };
					}

					group.content.push({
						type: ContentType.Video,
						value: this.preprocessServerUri(value),
						read: false,
						partial: false,
					});
					break;

				case 'html':
					if (!group) {
						group = { weight: Constants.LARGE_CONTENT_WEIGHT, content: [], columnCount: 1 };
					}

					group.content.push({
						type: ContentType.Html,
						value: this.preprocessServerUri(value),
						read: false,
						partial: false,
					});
					break;

				default:
					break;
			}
		}

		if (group) {
			groups.push(group);
			initGroup(group);
		}

		this.appDispatch(showContent(groups));

		if (runContentLoadTimer) {
			this.appDispatch(startLoadTimer());
			this.loadStart = new Date();
		}
	}

	onAds(ads: string) {
		this.appDispatch(showText(ads));
	}

	onAnswers(answers: string[]) {
		this.appDispatch(playersAnswersChanged(answers));
	}

	onAppellation(appellation: boolean) {
		this.appDispatch(setIsAppellation(appellation));
	}

	onApellationEnabled(enabled: boolean) {
		this.dispatch(roomActionCreators.areApellationsEnabledChanged(enabled));
	}

	onAskAnswer() {
		if (this.getState().table.layoutMode === LayoutMode.Simple) {
			this.dispatch(roomActionCreators.isAnswering());
			this.appDispatch(setContext(ContextView.Answer));
		} else {
			this.appDispatch(isSelectableChanged(true));
		}

		this.appDispatch(setDecisionType(DecisionType.Answer));
	}

	onAskSelectPlayer(reason: string, indices: number[]) {
		this.appDispatch(selectPlayers(indices));
		this.dispatch(roomActionCreators.selectionEnabled());
		this.appDispatch(setDecisionType(DecisionType.SelectPlayer));
		this.appDispatch(showmanReplicChanged(getAskSelectHint(reason)));
	}

	onAskStake(stakeModes: StakeModes, minimum: number, maximum: number, step: number, reason: string, playerName: string | null) {
		this.dispatch(roomActionCreators.setStakes(stakeModes, minimum, maximum, step, playerName));
		this.appDispatch(setDecisionType(DecisionType.Stake));
	}

	onAskValidate(playerIndex: number, answer: string) {
		this.appDispatch(askValidation({ playerIndex, answer }));
	}

	onAvatarChanged(personName: string, contentType: string, uri: string) {
		switch (contentType) {
			case 'image':
				this.appDispatch(personAvatarChanged({ personName, avatarUri: uri }));
				break;

			case 'video':
				this.appDispatch(personAvatarVideoChanged({ personName, avatarUri: uri }));
				break;

			default:
				break;
		}
	}

	onBanned(ip: string, name: string) {
		this.dispatch(roomActionCreators.banned(ip, name));
		const { hostName } = this.getState().room2.persons;

		if (hostName) {
			this.appDispatch(userInfoChanged(stringFormat(localization.bannedNotification, hostName, name)));
		}
	}

	onBannedList(bannedList: Record<string, string>) {
		this.dispatch(roomActionCreators.bannedListChanged(bannedList));
	}

	onButtonBlockingTimeChanged(blockingTime: number) {
		this.dispatch(roomActionCreators.buttonBlockingTimeChanged(blockingTime));
	}

	onCancel() {
		this.dispatch(roomActionCreators.clearDecisions());
		this.appDispatch(setDecisionType(DecisionType.None));
		this.appDispatch(stopValidation());
		this.appDispatch(deselectPlayers());

		// TODO: remove setTimeout after server adjustement
		setTimeout(
			() => this.appDispatch(setContext(ContextView.None)),
			500,
		);
	}

	onConnected(account: Account, role: string, index: number) {
		if (account.name === this.getState().room2.name) {
			return;
		}

		this.appDispatch(personAdded(account));

		switch (role) {
			case 'showman':
				this.appDispatch(showmanChanged({ name: account.name, isHuman: true, isReady: false }));
				break;

			case 'player':
				this.appDispatch(playerChanged({ index, name: account.name, isHuman: true, isReady: false }));
				break;

			default:
				break;
		}
	}

	onContentHint(hint: string) {
		this.appDispatch(showContentHint(hint));

		setTimeout(
			() => {
				this.appDispatch(showContentHint(''));
			},
			6000
		);
	}

	onDisconnected(name: string) {
		this.appDispatch(personRemoved(name));

		// TODO: uncomment after stopping Special replics support
		// this.appDispatch(addToChat({
		// 	sender: '',
		// 	text: name + localization.disconnected,
		// 	level: MessageLevel.System,
		// }));

		const state = this.getState();

		if (state.room2.persons.showman.name === name) {
			this.appDispatch(showmanChanged({ name: Constants.ANY_NAME, isHuman: false, isReady: false }));
		} else {
			for (let i = 0; i < state.room2.persons.players.length; i++) {
				if (state.room2.persons.players[i].name === name) {
					this.appDispatch(playerChanged({ index: i, name: Constants.ANY_NAME, isHuman: false, isReady: false }));
					break;
				}
			}
		}
	}

	onGameClosed() {
		this.appDispatch(showText(localization.gameClosed));
		this.appDispatch(userWarnChanged(localization.gameClosed));

		this.appDispatch(addToChat({
			sender: '',
			text: localization.gameClosed,
			level: MessageLevel.System,
		}));
	}

	onGameThemes(gameThemes: string[]) {
		this.appDispatch(showGameThemes(gameThemes));
		this.playGameSound(GameSound.GAME_THEMES);

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.gameThemes}: ${gameThemes.join(', ')}`));
		}
	}

	onGameStatistics(statistics: PlayerStatistics[]) {
		this.appDispatch(showStatistics(statistics));

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.gameStatistics}:`));

			statistics.forEach(stat => {
				const logMessage = `${stat.name}: Right: ${stat.rightAnswerCount}/${stat.rightTotal}, ` +
					`Wrong: ${stat.wrongAnswerCount}/${stat.wrongTotal}`;
				this.appDispatch(addGameLog(logMessage));
			});
		}
	}

	onInfo(all: Persons, showman: PersonInfo, players: PlayerInfo[]) {
		this.appDispatch(infoChanged({ all, showman, players }));
		this.dispatch(actionCreators.sendAvatar() as any);
	}

	onJoinModeChanged(joinMode: JoinMode, inform: boolean) {
		this.appDispatch(setJoinMode(joinMode));

		if (!inform) {
			return;
		}

		const message = this.getJoinModeMessage(joinMode);
		const { hostName } = this.getState().room2.persons;

		if (hostName) {
			this.appDispatch(userInfoChanged(`${hostName} ${localization.setJoinMode}: ${message}`));
		}
	}

	onHint(hint: string) {
		this.dispatch(roomActionCreators.hintChanged(hint));
	}

	onHostNameChanged(hostName: string | null, changeSource: string | null) {
		this.appDispatch(setHostName(hostName));

		if (hostName && changeSource) {
			this.appDispatch(addToChat({
				sender: '',
				text: stringFormat(localization.hostNameChanged, changeSource, hostName),
				level: MessageLevel.System,
			}));
		}
	}

	onMediaLoaded(playerName: string) {
		const { players } = this.getState().room2.persons;

		for (let i = 0; i < players.length; i++) {
			if (players[i].name === playerName) {
				this.appDispatch(playerMediaLoaded(i));
				break;
			}
		}
	}

	onMediaPreloaded(playerName: string) {
		const { players } = this.getState().room2.persons;

		for (let i = 0; i < players.length; i++) {
			if (players[i].name === playerName) {
				this.appDispatch(playerMediaPreloaded(i));
				break;
			}
		}
	}

	onMediaPreloadProgress(playerName: string, progress: number) {
		this.appDispatch(showMediaPreloadProgress({ playerName, progress }));
	}

	onOptionChanged(name: string, value: string, reason: string) {
		switch (name) {
			case 'Oral': {
				const oralEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingOral(oralEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						oralEnabled ? localization.oralGameEnabled : localization.oralGameDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'Managed': {
				const managedEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingManaged(managedEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						managedEnabled ? localization.managedGameEnabled : localization.managedGameDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'FalseStart': {
				const falseStartEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingFalseStart(falseStartEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						falseStartEnabled ? localization.falseStartEnabled : localization.falseStartDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'ReadingSpeed': {
				this.appDispatch(setSettingReadingSpeed(parseInt(value, 10)));

				if (reason.length > 0) {
					const message = stringFormat(
						localization.readingSpeedChanged,
						reason,
						value
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'PartialText': {
				const partialTextEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingPartialText(partialTextEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						partialTextEnabled ? localization.partialTextEnabled : localization.partialTextDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'PartialImages': {
				const partialImagesEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingPartialImages(partialImagesEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						partialImagesEnabled ? localization.partialImagesEnabled : localization.partialImagesDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'PartialImageTime': {
				this.appDispatch(setSettingPartialImageTime(parseInt(value, 10)));

				if (reason.length > 0) {
					const message = stringFormat(
						localization.partialImageTimeChanged,
						reason,
						value
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'UseApellations': {
				const useApellationsEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingUseApellations(useApellationsEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						useApellationsEnabled ? localization.useApellationsEnabled : localization.useApellationsDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'TimeForBlockingButton': {
				this.appDispatch(setSettingTimeForBlockingButton(parseInt(value, 10)));

				if (reason.length > 0) {
					const message = stringFormat(
						localization.blockingTimeChanged,
						reason,
						value
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			case 'DisplayAnswerOptionsLabels': {
				const displayLabelsEnabled = value.toLowerCase() === 'true';
				this.appDispatch(setSettingDisplayAnswerOptionsLabels(displayLabelsEnabled));

				if (reason.length > 0) {
					const message = stringFormat(
						displayLabelsEnabled ? localization.displayLabelsEnabled : localization.displayLabelsDisabled,
						reason
					);

					this.appDispatch(userInfoChanged(message));

					this.appDispatch(addToChat({
						sender: '',
						text: message,
						level: MessageLevel.System,
					}));
				}
				break;
			}

			default:
				break;
		}
	}

	onOralAnswer() {
		this.appDispatch(setContext(ContextView.OralAnswer));
		this.appDispatch(setDecisionType(DecisionType.OralAnswer));
	}

	onPackage(packageName: string, packageLogo: string | null) {
		if (packageLogo) {
			this.appDispatch(captionChanged(localization.package));

			this.onContent('screen', [{
				type: 'image',
				value: packageLogo
			}, {
				type: 'text',
				value: packageName
			}]);
		} else {
			this.appDispatch(showObject({ header: localization.package, text: packageName, hint: '', large: false, animate: false }));
		}
	}

	onPass(playerIndex: number) {
		this.appDispatch(playerStateChanged({ index: playerIndex, state: PlayerStates.Pass }));
	}

	onPin(pin: string) {
		this.appDispatch(copyToClipboard(pin));
		this.appDispatch(userInfoChanged(localization.pinCopied));
	}

	onPlayerAnswer(playerIndex: number, answer: string) {
		// this.appDispatch(setPlayerAnswer({ index: playerIndex, answer })); // TODO: think about providing unified answering experience
		this.appDispatch(playerReplicChanged({ playerIndex, replic: answer }));
	}

	onPlayerState(state: PlayerStates, playerIndicies: number[]) {
		this.appDispatch(playerStatesChanged({ indices: playerIndicies, state }));

		if (state === PlayerStates.Lost) {
			setTimeout(
				() => {
					this.appDispatch(playerLostStatesDropped(playerIndicies));
				},
				800
			);
		}
	}

	onQrCode(qrCode: string | null) {
		this.appDispatch(setQrCode(qrCode));
	}

	onQuestionAnswers(rightAnswers: string[], wrongAnswers: string[]) {
		this.appDispatch(questionAnswersChanged({ rightAnswers, wrongAnswers }));
	}

	onQuestionAuthors(authors: string[]) {
		this.appDispatch(addToChat({
			sender: localization.questionAuthors,
			text: authors.join(', '),
			level: MessageLevel.System,
		}));
	}

	onQuestionComments(comments: string) {
		this.appDispatch(captionChanged(localization.questionComments));
		this.appDispatch(showText(comments));
	}

	onQuestionSources(sources: string[]) {
		this.appDispatch(addToChat({
			sender: localization.questionSources,
			text: sources.join(', '),
			level: MessageLevel.System,
		}));
	}

	onReady(personName: string, isReady: boolean): void {
		let personIndex: number;
		const state = this.getState();

		if (personName === state.room2.persons.showman.name) {
			personIndex = -1;
		} else {
			personIndex = state.room2.persons.players.findIndex(p => p.name === personName);

			if (personIndex === -1) {
				return;
			}
		}

		this.appDispatch(isReadyChanged({ personIndex, isReady }));
	}

	onResumeMedia() {
		this.appDispatch(resumeMedia());
	}

	onReport(report: string) {
		this.appDispatch(setReport(report));
	}

	onRoundContent(content: string[]) {
		const baseDelay = 500; // Base delay between requests
		const maxRetries = 3;
		let lastNotifiedProgressTens = 0;

		// Helper function to notify progress at 10% intervals
		const notifyProgress = (progress: number) => {
			const progressPercent = Math.floor(progress * 100);
			const progressTens = Math.floor(progressPercent / 10) * 10;

			if (progressTens > lastNotifiedProgressTens && progressTens >= 10) {
				lastNotifiedProgressTens = progressTens;
				this.appDispatch(mediaPreloadProgress(progressPercent));
			}
		};

		// Helper function to preload a single file with retry logic
		const preloadFile = (contentUri: string, retryCount = 0): Promise<void> => fetch(contentUri, { cache: 'force-cache' })
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			})
			.catch((error) => {
				if (retryCount < maxRetries) {
					const retryDelay = Math.min(baseDelay * Math.pow(2, retryCount), 5000);
					console.log(`Retrying preload of ${contentUri} (attempt ${retryCount + 1}/${maxRetries}) after ${retryDelay}ms`);

					return new Promise<void>((resolve, reject) => {
						setTimeout(() => {
							preloadFile(contentUri, retryCount + 1).then(resolve).catch(reject);
						}, retryDelay);
					});
				} else {
					console.warn(`Failed to preload ${contentUri} after ${maxRetries} attempts: ${getErrorMessage(error)}`);

					this.appDispatch(addToChat({
						sender: '',
						text: getErrorMessage(error),
						level: MessageLevel.System,
					}));
					// Don't reject - just log the failure and continue
				}
			});

		// Process files one by one using a for loop
		const processFiles = async () => {
			const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
			const totalFiles = content.length;

			for (let i = 0; i < content.length; i += 1) {
				const url = content[i];
				const contentUri = this.preprocessServerUri(url);

				// Add delay between requests (except for first request)
				if (i > 0) {
					// eslint-disable-next-line no-await-in-loop
					await delay(baseDelay);
				}

				try {
					// eslint-disable-next-line no-await-in-loop
					await preloadFile(contentUri);
				} catch (error) {
					// Continue processing even if this file failed
					console.error(`Failed to preload ${url}: ${getErrorMessage(error)}`);
				}

				// Calculate and notify progress after each file
				const progress = (i + 1) / totalFiles;
				notifyProgress(progress);
			}

			// Ensure 100% is always notified at the end
			if (lastNotifiedProgressTens < 100) {
				this.appDispatch(mediaPreloadProgress(100));
			}

			this.appDispatch(mediaPreloaded());
		};

		// Start processing files
		processFiles();
	}

	onRoundThemes(roundThemesNames: string[], playMode: ThemesPlayMode) {
		if (playMode === ThemesPlayMode.OneByOne) {
			this.playGameSound(GameSound.ROUND_THEMES, true);
		}

		const roundThemes: ThemeInfo[] = roundThemesNames.map(t => ({ name: t, comment: '', questions: [] }));

		this.appDispatch(showRoundThemes({
			roundThemes,
			isFinal: playMode === ThemesPlayMode.AllTogether,
			display: playMode === ThemesPlayMode.AllTogether,
		}));

		this.appDispatch(questionReset());
	}

	onRoundThemesComments(comments: string[]) {
		this.appDispatch(setThemesComments(comments));
	}

	onSetAttachContentToTable(attach: boolean) {
		this.appDispatch(setAttachContentToTable(attach));
	}

	onShowmanReplic(messageIndex: number, messageCode: string) {
		const text = localization.getString('replic_' + messageCode.toString());

		if (text) {
			this.appDispatch(showmanReplicChanged(text));
		}
	}

	onStage(stage: string, stageName: string, stageIndex: number, rules: string) {
		const state = this.getState();

		this.appDispatch(stopAudio());
		this.dispatch(roomActionCreators.stageChanged(stage, stageIndex));

		if (stage !== GameStage.Before) {
			if (state.settings.writeGameLog && !state.room2.stage.isGameStarted) {
				this.appDispatch(addGameLog(`${localization.gameStarted}: ${new Date().toLocaleString()}`));
			}

			this.appDispatch(setIsGameStarted(true));
		}

		if (stage === GameStage.Round || stage === GameStage.Final) {
			this.playGameSound(GameSound.ROUND_BEGIN);
			const { roundTail } = localization;
			const roundName = stageName.endsWith(roundTail) ? stageName.substring(0, stageName.length - roundTail.length) : stageName;
			this.appDispatch(showObject({ header: localization.round, text: roundName, hint: getRuleString(rules), large: true, animate: false }));

			if (stage === GameStage.Round) {
				for	(let i = 0; i < state.room2.persons.players.length; i++) {
					this.appDispatch(playerInGameChanged({ playerIndex: i, inGame: true }));
				}
			}

			this.appDispatch(captionChanged(''));

			if (state.settings.writeGameLog) {
				this.appDispatch(addGameLog(''));
				this.appDispatch(addGameLog(`${localization.round}: ${stageName}`));
			}
		} else if (stage === GameStage.Begin || stage === GameStage.After) {
			this.appDispatch(showLogo());
			this.appDispatch(captionChanged(stage === GameStage.Begin ? localization.gameStarted : localization.gameFinished));
		}

		this.appDispatch(playersStateCleared());
		this.appDispatch(playerRoundStateCleared());
		this.dispatch(roomActionCreators.gameStateCleared());
		this.dispatch(roomActionCreators.clearDecisionsAndMainTimer());
		this.appDispatch(clearDecisions());
		this.appDispatch(setDecisionType(DecisionType.None));
		this.appDispatch(stopValidation());
		this.appDispatch(isSelectableChanged(false));
		this.appDispatch(clearActiveState());
		this.appDispatch(canPressChanged(false));
		this.appDispatch(setContext(ContextView.None));
		this.appDispatch(clearAudio());

		this.dispatch(roomActionCreators.hintChanged(null));
	}

	onStageInfo(stage: string, _stageName: string, stageIndex: number) {
		this.dispatch(roomActionCreators.stageChanged(stage, stageIndex));

		if (stage !== GameStage.Before) {
			this.appDispatch(setIsGameStarted(true));
		}

		if (stage === GameStage.After) {
			this.appDispatch(showLogo());
		}
	}

	onTimeout() {
		this.playGameSound(GameSound.ROUND_TIMEOUT);
	}

	onValidation(
		header: string,
		name: string,
		answer: string,
		message: string,
		rightAnswers:
		string[],
		wrongAnswers: string[],
		showExtraRightButtons: boolean) {
		this.appDispatch(validate({ header, name, answer, message, rightAnswers, wrongAnswers, showExtraRightButtons }));
	}

	onUnbanned(name: string) {
		this.dispatch(roomActionCreators.unbanned(name));

		this.appDispatch(addToChat({
			sender: '',
			text: stringFormat(localization.userUnbanned, name),
			level: MessageLevel.System,
		}));
	}

	onWinner() {
		this.playGameSound(GameSound.APPLAUSE_FINAL);

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.gameFinished}: ${new Date().toLocaleString()}`));
			this.appDispatch(addGameLog(localization.gameResults));

			const { players } = this.getState().room2.persons;

			for (let i = 0; i < players.length; i++) {
				const player = players[i];
				this.appDispatch(addGameLog(`${player.name}: ${player.sum}`));
			}
		}
	}

	onWrongTry(playerIndex: number) {
		const { players } = this.getState().room2.persons;

		if (playerIndex > -1 && playerIndex < players.length) {
			const player = players[playerIndex];

			if (player.state === PlayerStates.None) {
				this.appDispatch(playerStateChanged({ index: playerIndex, state: PlayerStates.Lost }));

				setTimeout(
					() => {
						this.appDispatch(playerLostStateDropped(playerIndex));
					},
					800
				);
			}
		}
	}

	onContent(placement: string, content: ContentInfo[]) {
		switch (placement) {
			case 'screen':
				this.onScreenContent(content);
				break;

			case 'replic':
				const replic = content[0];

				if (replic.type === 'text') {
					this.onReplic('s', replic.value);
				}

				this.dispatch(switchToContent());
				break;

			case 'background':
				const backgroundContent = content[0];

				if (backgroundContent.type === 'audio') {
					const uri = this.preprocessServerUri(backgroundContent.value);

					if (this.getState().table.audio === uri) {
						this.appDispatch(clearAudio()); // Forcing audio reload
					}

					this.appDispatch(showBackgroundAudio(uri));
				}
				break;

			default:
				break;
		}
	}

	onAnswerOption(index: number, label: string, contentType: string, contentValue: string) {
		this.appDispatch(updateOption({
			index,
			label,
			contentType: contentType === 'text' ? ContentType.Text : ContentType.Image,
			value: contentValue,
		}));

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${label}: ${contentValue}`));
		}
	}

	onThemeComments(themeComments: string) {
		this.appDispatch(prependTextChanged(themeComments));
	}

	onContentAppend(placement: string, layoutId: string, contentType: string, contentValue: string) {
		this.appDispatch(appendPartialText(contentValue));

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(appendGameLog(contentValue));
		}
	}

	onContentShape(text: string) {
		this.appDispatch(showPartialText(text));

		const groups: ContentGroup[] = [{
			content: [
				{
					type: ContentType.Text,
					value: '',
					read: false,
					partial: true
				}
			],
			weight: 1,
			columnCount: 1
		}];

		this.appDispatch(showContent(groups));

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(''));
		}
	}

	onContentState(placement: string, layoutId: number, itemState: ItemState) {
		const state = this.getState();

		if (state.table.layoutMode === LayoutMode.AnswerOptions &&
			placement === 'screen' &&
			layoutId > 0 &&
			layoutId <= state.table.answerOptions.length &&
			itemState) {
			this.appDispatch(updateOptionState({ index: layoutId - 1, state: itemState }));
		}
	}

	onAnswerOptionsLayout(questionHasScreenContent: boolean, typeNames: string[]) {
		const options: AnswerOption[] = [];

		for (let i = 0; i < typeNames.length; i++) {
			const typeName = typeNames[i];

			options.push({
				label: '',
				state: ItemState.Normal,
				content: { type: ContentType[typeName as keyof typeof ContentType], value: '', read: false, partial: false }
			});
		}

		this.appDispatch(answerOptions({ questionHasScreenContent, options }));
	}

	onBeginPressButton() {
		this.appDispatch(canPressChanged(true));
		this.resumeLoadTimerIfNeeded();
	}

	onEndPressButtonByPlayer(index: number) {
		this.appDispatch(canPressChanged(false));
		this.appDispatch(playerStateChanged({ index, state: PlayerStates.Press }));
		this.pauseLoadTimerIfNeeded();
		this.playGameSound(GameSound.BUTTON_PRESSED);
	}

	onEndPressButtonByTimeout() {
		this.appDispatch(canPressChanged(false));
		this.dispatch(roomActionCreators.stopTimer(1));
		this.playGameSound(GameSound.QUESTION_NOANSWERS);
	}

	onReplic(personCode: string, text: string) {
		const state = this.getState();

		if (state.settings.writeGameLog) {
			if (personCode === 's' || (personCode.startsWith('p') && personCode.length > 1)) {
				const name = personCode === 's'
					? state.room2.persons.showman.name
					: state.room2.persons.players[parseInt(personCode.substring(1), 10)]?.name;

				this.appDispatch(addGameLog(`${name}: ${text}`));
			} else if (personCode === 'l') {
				this.appDispatch(addGameLog(text));
			}
		}

		if (personCode === 's') {
			this.appDispatch(showmanReplicChanged(text));
			return;
		}

		if (personCode !== 'l') {
			return;
		}

		this.appDispatch(addToChat({ sender: '', text, level: MessageLevel.System }));
	}

	onTable(table: ThemeInfo[], isFinal: boolean) {
		this.appDispatch(showRoundThemes({ roundThemes: table, isFinal, display: false }));
	}

	onShowTable() {
		this.appDispatch(showRoundTable());
		this.appDispatch(stopAudio());
		this.appDispatch(canPressChanged(false));
		this.dispatch(roomActionCreators.stopTimer(1));
	}

	onTableCaption(caption: string) {
		this.appDispatch(captionChanged(caption));
	}

	onQuestionSelected(themeIndex: number, questionIndex: number) {
		this.appDispatch(playersStateCleared());
		this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
		this.appDispatch(questionReset());
		this.playGameSound(GameSound.QUESTION_SELECTED);

		const state = this.getState();

		const themeInfo = state.table.roundInfo[themeIndex];

		if (themeInfo) {
			if (questionIndex > -1 && questionIndex <= themeInfo.questions.length) {
				const price = themeInfo.questions[questionIndex]; // Can be 0
				this.dispatch(roomActionCreators.currentPriceChanged(price));
				this.appDispatch(captionChanged(`${themeInfo.name}, ${price}`));
				this.appDispatch(blinkQuestion({ themeIndex, questionIndex }));

				setTimeout(
					() => {
						this.appDispatch(updateQuestion({ themeIndex, questionIndex, price: -1 }));

						// Call getState() to use actual state
						if (this.getState().table.mode === TableMode.RoundTable) {
							this.appDispatch(showObject({ header: themeInfo.name, text: price.toString(), hint: '', large: true, animate: false }));
						}
					},
					500,
				);

				if (state.settings.writeGameLog) {
					this.appDispatch(addGameLog(`${themeInfo.name}, ${price}`));
				}
			}
		}
	}

	onTheme(themeName: string, animate: boolean) {
		if (!animate) {
			// TODO: looks like all this is handled by endquestion message, so we can remove this
			this.appDispatch(playersStateCleared());
			this.appDispatch(showmanReplicChanged(''));
			this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
			this.appDispatch(canPressChanged(false));
			this.dispatch(roomActionCreators.stopTimer(1));
		} else {
			this.dispatch(captionChanged(localization.roundThemes));
		}

		this.appDispatch(showObject({ header: animate ? '' : localization.theme, text: themeName, hint: '', large: false, animate }));
		this.dispatch(roomActionCreators.themeNameChanged(themeName));

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.theme}: ${themeName}`));
		}
	}

	onQuestion(questionPrice: string) {
		const { themeName } = this.getState().room.stage;
		this.appDispatch(playersStateCleared());
		this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
		this.appDispatch(showObject({ header: themeName, text: questionPrice, hint: '', large: true, animate: false }));
		this.appDispatch(captionChanged(`${themeName}, ${questionPrice}`));
		this.appDispatch(questionReset());
	}

	onTimerMaximumChanged(timerIndex: number, maximum: number) {
		this.dispatch(roomActionCreators.timerMaximumChanged(timerIndex, maximum));
	}

	onPlayersVisibilityChanged(isVisible: boolean) {
		this.appDispatch(playersVisibilityChanged(isVisible));
	}

	onTimerRun(timerIndex: number, timerArgument: number, timerPersonIndex: number | null) {
		this.dispatch(roomActionCreators.runTimer(timerIndex, timerArgument, false));

		if (timerIndex === 2 && timerPersonIndex !== null) {
			if (timerPersonIndex === -1) {
				this.appDispatch(activateShowmanDecision());
			} else if (timerPersonIndex === -2) {
				this.dispatch(roomActionCreators.showMainTimer());
			} else if (timerPersonIndex > -1 && timerPersonIndex < this.getState().room2.persons.players.length) {
				this.appDispatch(activatePlayerDecision(timerPersonIndex));
			}
		}
	}

	onTimerPause(timerIndex: number, currentTime: number) {
		this.dispatch(roomActionCreators.pauseTimer(timerIndex, currentTime, false));
	}

	onTimerResume(timerIndex: number) {
		this.dispatch(roomActionCreators.resumeTimer(timerIndex, false));
	}

	onTimerStop(timerIndex: number) {
		this.dispatch(roomActionCreators.stopTimer(timerIndex));

		if (timerIndex === 2) {
			this.dispatch(roomActionCreators.clearDecisionsAndMainTimer());
			this.appDispatch(clearDecisions());
			this.appDispatch(stopAudio());
		}
	}

	onQuestionType(questionType: string, isDefault: boolean, isNoRisk: boolean) {
		this.dispatch(roomActionCreators.isQuestionChanged(true, questionType));
		this.appDispatch(setNoRiskMode(isNoRisk));

		if (isDefault) {
			return;
		}

		let text, hint = '';

		switch (questionType) {
			case 'simple': // 'withButton':
				text = localization.questionTypeSimple;
				hint = localization.questionTypeSimpleHint;
				break;

			case 'forAll':
				this.playGameSound(GameSound.QUESTION_ALL);
				text = localization.questionTypeForAll;
				hint = localization.questionTypeForAllHint;
				break;

			case 'stake':
				this.playGameSound(GameSound.QUESTION_STAKE);
				text = localization.questionTypeStake;
				hint = localization.questionTypeStakeHint;
				break;

			case 'stakeAll': // 'forAllWithStake':
				this.playGameSound(GameSound.QUESTION_STAKE_ALL);
				text = localization.questionTypeForAllWithStake;
				hint = localization.questionTypeForAllWithStakeHint;
				break;

			case 'secret':
			case 'secretPublicPrice':
			case 'secretNoQuestion':
				this.playGameSound(GameSound.QUESTION_SECRET);
				text = localization.questionTypeSecret;
				hint = localization.questionTypeSecretHint;
				this.appDispatch(questionReset());
				break;

			case 'noRisk': // 'forYourself':
				this.playGameSound(GameSound.QUESTION_NORISK);
				text = localization.questionTypeForYourself;
				hint = localization.questionTypeForYourselfHint;
				break;

			default:
				return;
		}

		this.appDispatch(showQuestionType({
			header: localization.question,
			text: text.toUpperCase() + (isNoRisk ? ' 🛡' : ''),
			hint: hint,
		}));
	}

	onThemeDeleted(themeIndex: number) {
		const themeInfo = this.getState().table.roundInfo[themeIndex];

		if (!themeInfo) {
			return;
		}

		this.appDispatch(stopAudio()); // To erase previous FINAL_DELETE sound (hacky way. Is there an alternative?)
		this.playGameSound(GameSound.FINAL_DELETE);
		this.appDispatch(blinkTheme(themeIndex));

		setTimeout(
			() => {
				this.appDispatch(removeTheme(themeIndex));
			},
			600
		);
	}

	onRightAnswerCore(rightAnswer: string) {
		this.appDispatch(setAnswerView(this.getState().table.layoutMode === LayoutMode.Simple ? rightAnswer : ''));
	}

	onRightAnswerStart(rightAnswer: string) {
		this.onRightAnswerCore(rightAnswer);
		this.appDispatch(captionChanged(localization.rightAnswer));
	}

	onRightAnswer(answer: string) {
		this.onRightAnswerCore(answer);

		if (this.getState().table.layoutMode === LayoutMode.Simple) {
			this.appDispatch(captionChanged(localization.rightAnswer));
			this.appDispatch(showText(answer));
		} else {
			this.appDispatch(rightOption(answer));
		}

		this.dispatch(roomActionCreators.afterQuestionStateChanged(true));
		this.dispatch(roomActionCreators.hintChanged(null));

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.rightAnswer}: ${answer}`));
		}
	}

	onChoose() {
		this.appDispatch(isSelectableChanged(true));
		this.appDispatch(setDecisionType(DecisionType.Choose));
	}

	onStop() {
		this.dispatch(roomActionCreators.stopTimer(0));
		this.dispatch(roomActionCreators.stopTimer(1));
		this.dispatch(roomActionCreators.stopTimer(2));

		this.appDispatch(showLogo());
		this.dispatch(roomActionCreators.clearDecisionsAndMainTimer());
		this.appDispatch(clearDecisions());

		this.onQuestionEnd(); // TODO: That should be sent by server, but we can call it here to ensure the game state is reset
	}

	onToggle(themeIndex: number, questionIndex: number, price: number) {
		const themeInfo = this.getState().table.roundInfo[themeIndex];

		if (themeInfo) {
			const existingPrice = themeInfo.questions[questionIndex];

			if (existingPrice) {
				this.appDispatch(updateQuestion({ themeIndex, questionIndex, price }));
			}
		}
	}

	onQuestionEnd() {
		this.dispatch(roomActionCreators.afterQuestionStateChanged(true));
		this.dispatch(roomActionCreators.isQuestionChanged(false, ''));
		this.appDispatch(endQuestion());
		this.appDispatch(setNoRiskMode(false));

		const state = this.getState();

		if (state.settings.writeGameLog) {
			const score = `${localization.score}: ${state.room2.persons.players.map(p => `${p.name}: ${p.sum}`).join(', ')}`;
			this.appDispatch(addGameLog(score));
		}
	}

	addPlayerTable() {
		this.appDispatch(playerAdded());
	}

	deletePlayerTable(index: number) {
		const state = this.getState();
		const player = state.room2.persons.players[index];
		const person = state.room2.persons.all[player.name];

		this.appDispatch(playerDeleted(index));

		if (person && !person.isHuman) {
			this.appDispatch(personRemoved(person.name));
		} else if (player.name === state.room2.name) {
			this.appDispatch(setRoomRole(Role.Viewer));
		}
	}

	onPause(isPaused: boolean, currentTime: number[]) {
		this.appDispatch(setIsPaused(isPaused));

		if (currentTime.length > 2) {
			if (isPaused) {
				this.dispatch(roomActionCreators.pauseTimer(0, currentTime[0], true));
				this.dispatch(roomActionCreators.pauseTimer(1, currentTime[1], true));
				this.dispatch(roomActionCreators.pauseTimer(2, currentTime[2], true));

				this.pauseLoadTimerIfNeeded();
			} else {
				this.dispatch(roomActionCreators.resumeTimer(0, true));
				this.dispatch(roomActionCreators.resumeTimer(1, true));
				this.dispatch(roomActionCreators.resumeTimer(2, true));

				this.resumeLoadTimerIfNeeded();
			}
		}
	}

	private pauseLoadTimerIfNeeded() {
		const state = this.getState();
		const { loadTimer } = state.table;

		if (this.loadStart && loadTimer.state === TimerStates.Running) {
			const allTime = state.room2.settings.timeSettings.partialImageTime * 1000;
			const passedTime = new Date().getTime() - this.loadStart.getTime();

			if (passedTime < allTime) {
				const value = loadTimer.maximum * passedTime / allTime;
				this.appDispatch(pauseLoadTimer(value));
			}
		}
	}

	private resumeLoadTimerIfNeeded() {
		const state = this.getState();
		const { loadTimer } = state.table;

		if (loadTimer.state === TimerStates.Paused) {
			const allTime = state.room2.settings.timeSettings.partialImageTime * 1000;
			const passedTime = loadTimer.value * allTime / loadTimer.maximum;
			this.loadStart = new Date(new Date().getTime() - passedTime);
			this.appDispatch(resumeLoadTimer());
		}
	}

	onTableChangeType(personType: string, index: number, isHuman: boolean, name: string, sex: Sex) {
		const state = this.getState();
		const isPlayer = personType === 'player';
		const account = isPlayer ? state.room2.persons.players[index] : state.room2.persons.showman;
		const person = state.room2.persons.all[account.name];

		if (person && person.isHuman === isHuman) {
			return;
		}

		if (!isHuman) {
			const newAccount: Account = {
				name: name,
				isHuman: false,
				sex: sex,
				avatar: null
			};

			this.appDispatch(personAdded(newAccount));
		}

		this.appDispatch(isPlayer
			? playerChanged({ index, name, isHuman, isReady: false })
			: showmanChanged({ name, isHuman, isReady: false }));

		if (isHuman) {
			this.appDispatch(personRemoved(person.name));
		}

		if (person && person.name === state.room2.name) {
			this.appDispatch(setRoomRole(Role.Viewer));
		}
	}

	onTableSet(role: string, index: number, replacer: string, replacerSex: Sex) {
		const state = this.getState();
		const isPlayer = role === 'player';
		const account = isPlayer ? state.room2.persons.players[index] : state.room2.persons.showman;
		const person = state.room2.persons.all[account.name];

		if (person && !person.isHuman) {
			this.appDispatch(isPlayer
				? playerChanged({ index, name: replacer, isReady: false })
				: showmanChanged({ name: replacer, isReady: false }));

				this.appDispatch(personRemoved(person.name));

			const newAccount: Account = {
				name: replacer,
				isHuman: false,
				sex: replacerSex,
				avatar: null
			};

			this.appDispatch(personAdded(newAccount));
			return;
		}

		if (state.room2.persons.showman.name === replacer) { // isPlayer
			this.appDispatch(showmanChanged({ name: account.name, isHuman: true, isReady: account.isReady }));
			this.appDispatch(playerChanged({ index, name: replacer, isHuman: true, isReady: state.room2.persons.showman.isReady }));

			if (account.name === state.room2.name) {
				this.appDispatch(setRoomRole(Role.Showman));
			} else if (replacer === state.room2.name) {
				this.appDispatch(setRoomRole(Role.Player));
			}

			return;
		}

		for (let i = 0; i < state.room2.persons.players.length; i++) {
			if (state.room2.persons.players[i].name === replacer) {
				if (isPlayer) {
					this.appDispatch(playersSwap({ index1: index, index2: i }));
				} else {
					const { isReady } = state.room2.persons.players[i];

					this.appDispatch(playerChanged({ index: i, name: account.name, isReady: account.isReady }));
					this.appDispatch(showmanChanged({ name: replacer, isReady }));

					if (state.room2.persons.showman.name === state.room2.name) {
						this.appDispatch(setRoomRole(Role.Player));
					} else if (replacer === state.room2.name) {
						this.appDispatch(setRoomRole(Role.Showman));
					}
				}

				return;
			}
		}

		this.appDispatch(isPlayer
			? playerChanged({ index, name: replacer, isReady: false })
			: showmanChanged({ name: replacer, isReady: false }));

		if (account.name === state.room2.name) {
			this.appDispatch(setRoomRole(Role.Viewer));
		} else if (replacer === state.room2.name) {
			this.appDispatch(setRoomRole(isPlayer ? Role.Player : Role.Showman));
		}
	}

	onTableFree(personType: string, index: number) {
		const state = this.getState();
		const isPlayer = personType === 'player';

		this.appDispatch(isPlayer
			? playerChanged({ index, name: Constants.ANY_NAME, isReady: false })
			: showmanChanged({ name: Constants.ANY_NAME, isReady: false }));

		const account = isPlayer ? state.room2.persons.players[index] : state.room2.persons.showman;

		if (account.name === state.room2.name) {
			this.appDispatch(setRoomRole(Role.Viewer));
		}
	}

	onSetChooser(chooserIndex: number, setActive: boolean) {
		this.appDispatch(chooserChanged(chooserIndex));

		if (setActive) {
			this.appDispatch(playerStateChanged({ index: chooserIndex, state: PlayerStates.Press }));

			const state = this.getState();

			const indices = state.room2.persons.players
				.map((_, i) => i)
				.filter(i => i !== chooserIndex);

			this.appDispatch(playerStatesChanged({ indices, state: PlayerStates.Pass }));
		}

		// TODO: show notification about chooser change
	}

	onSum(playerIndex: number, value: number) {
		this.appDispatch(playerSumChanged({ index: playerIndex, value }));
	}

	onSums(sums: number[]) {
		this.appDispatch(sumsChanged(sums));
	}

	onPerson(playerIndex: number, isRight: boolean) {
		const state = this.getState();

		if (playerIndex > -1 && playerIndex < state.room2.persons.players.length) {
			this.appDispatch(playerStateChanged({ index: playerIndex, state: isRight ? PlayerStates.Right : PlayerStates.Wrong }));

			const rightApplause = state.room.stage.currentPrice >= 2000
				? GameSound.APPLAUSE_BIG
				: GameSound.APPLAUSE_SMALL;

			this.playGameSound(isRight ? rightApplause : GameSound.ANSWER_WRONG);
		}
	}

	onFinalThink() {
		this.playGameSound(GameSound.FINAL_THINK, true);
	}

	onUserError(errorCode: ErrorCode, args: string[]) {
		const error = getUserError(errorCode, args);

		if (error.length > 0) {
			this.appDispatch(userWarnChanged(error));
		}
	}

	getJoinModeMessage(joinMode: JoinMode) {
		switch (joinMode) {
			case JoinMode.AnyRole:
				return localization.joinModeAnyRole;

			case JoinMode.OnlyViewer:
				return localization.joinModeViewer;

			case JoinMode.Forbidden:
				return localization.joinModeForbidden;

			default:
				return '';
		}
	}
}

