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
import IClientController from './IClientController';
import ChatMessage from '../model/ChatMessage';

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
	setExternalMediaWarning,
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
	setRoundThemes,
	showThemeStack,
	showStatistics,
	showText,
	startLoadTimer,
	switchToContent,
	updateOption,
	updateOptionState,
	updateQuestion,
	appendExternalMediaWarning,
	addRoundTheme,
	clearRoundThemes,
	setAnswerDeviation,
	addPointMarker,
	overlayPoints } from '../state/tableSlice';

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
	playerStakeChanged,
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
	incrementQuestionCounter,
	resetQuestionCounter,
	setTheme,
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
	setRoundsNames,
	setShowMainTimer,
	runTimer,
	pauseTimer,
	resumeTimer,
	stopTimer,
	timerMaximumChanged,
	setPlayerApellating,
	answerChanged,
	answerTypeChanged,
	showLeftSeconds,
	setReview,
} from '../state/room2Slice';

import PersonInfo from '../model/PersonInfo';
import Persons from '../model/Persons';
import PlayerInfo from '../model/PlayerInfo';
import actionCreators from './actionCreators';
import StakeModes from '../client/game/StakeModes';
import { playAudio, stopAudio, userInfoChanged, userWarnChanged } from '../state/commonSlice';
import { getUserError } from '../utils/ErrorHelpers';
import { playersVisibilityChanged, setQrCode } from '../state/uiSlice';
import ErrorCode from '../client/contracts/ErrorCode';
import { setAttachContentToTable } from '../state/settingsSlice';
import { addGameLog, appendGameLog, copyToClipboard } from '../state/globalActions';
import stringFormat from '../utils/StringHelpers';
import JoinMode from '../client/game/JoinMode';
import getBestRowColumnCount from '../utils/stackedContentHelper';
import { preloadRoundContent } from './contentPreloader';
import StakeTypes from '../model/enums/StakeTypes';

// Non-idempotent initialization of group properties
function initGroup(group: ContentGroup) {
	const { rowCount, columnCount } = getBestRowColumnCount(group.content.length);

	group.columnCount = columnCount;
	group.weight *= rowCount;
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

export default class ClientController implements IClientController {
	constructor(
		private dispatch: Dispatch<AnyAction>,
		private appDispatch: AppDispatch,
		private getState: () => State,
		private dataContext: DataContext,
		private loadStart: Date | null = null,
	) {}

	addSimpleMessage(message: string) {
		this.appDispatch(addToChat({
			sender: '',
			text: message,
			level: MessageLevel.System,
		}));
	}

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

	private isExternalUri(uri: string): boolean {
		if (!this.dataContext.contentUris || this.dataContext.contentUris.length === 0) {
			// If no content URIs defined, check against server URI
			return !uri.startsWith(this.dataContext.serverUri);
		}

		// Check if URI starts with any of the allowed content URIs
		return !this.dataContext.contentUris.some(contentUri => uri.startsWith(contentUri));
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
		const externalUris: string[] = [];
		const state = this.getState();

		for	(let i = 0; i < content.length; i += 1) {
			const { type, value } = content[i];

			switch (type) {
				case 'text': {
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
				}

				case 'image':
				case 'video':
				case 'html': {
					if (!group) {
						group = { weight: Constants.LARGE_CONTENT_WEIGHT, content: [], columnCount: 1 };
					}

					const processedUri = this.preprocessServerUri(value);

					// Check if this is external media
					if (this.isExternalUri(processedUri)) {
						externalUris.push(processedUri);
					}

					let contentType: ContentType;
					if (type === 'image') {
						contentType = ContentType.Image;
					} else if (type === 'video') {
						contentType = ContentType.Video;
					} else {
						contentType = ContentType.Html;
					}

					group.content.push({
						type: contentType,
						value: processedUri,
						read: false,
						partial: false,
					});

					// TODO: this logic should be moved to server
					if (type === 'image' &&
						state.room.stage.isQuestion &&
						state.room.stage.questionType === 'simple' &&
						!state.table.isAnswer &&
						!state.room2.settings.falseStart &&
						state.room2.settings.partialImages &&
						state.room2.settings.timeSettings.partialImageTime > 0) {
						runContentLoadTimer = true;
					}

					break;
				}

				default:
					break;
			}
		}

		if (group) {
			groups.push(group);
			initGroup(group);
		}

		// Set external media warning
		if (externalUris.length > 0) {
			this.appDispatch(setExternalMediaWarning(externalUris));
		}

		this.appDispatch(showContent(groups));

		if (runContentLoadTimer && externalUris.length === 0) {
			this.appDispatch(startLoadTimer());
			this.loadStart = new Date();
		}
	}

	private initQuestion() {
		this.appDispatch(playersStateCleared());
		this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
		this.appDispatch(questionReset());
		this.appDispatch(incrementQuestionCounter());
	}

	onAds(ads: string) {
		this.appDispatch(showText(ads));
	}

	onAnswerDeviation(deviation: number) {
		this.appDispatch(setAnswerDeviation(deviation));
	}

	onAnswers(answers: string[]) {
		this.appDispatch(playersAnswersChanged(answers));
	}

	onAppellation(appellation: boolean) {
		this.appDispatch(setIsAppellation(appellation));

		if (appellation) {
			this.appDispatch(isSelectableChanged(false));
		}
	}

	onAskAnswer(answerType: string | null) {
		if (this.getState().table.layoutMode === LayoutMode.AnswerOptions) {
			this.appDispatch(isSelectableChanged(true));
		} else {
			this.appDispatch(answerChanged(''));
			this.appDispatch(answerTypeChanged(answerType ?? ''));
		}

		this.appDispatch(setDecisionType(DecisionType.Answer));
	}

	onAskReview(packageUri: string | null) {
		this.appDispatch(setReview(packageUri));
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

	onAutomaticGameTimer(leftSeconds: number) {
		this.appDispatch(showLeftSeconds(leftSeconds));
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
		this.appDispatch(isSelectableChanged(false));

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

		this.appDispatch(stopAudio()); // To erase previous ROOM_ENTRY sound (hacky way. Is there an alternative?)
		this.playGameSound(GameSound.ROOM_ENTRY);
		this.addSimpleMessage(stringFormat(localization.connected, account.name));
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
		this.addSimpleMessage(stringFormat(localization.disconnected, name));

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
		this.addSimpleMessage(localization.gameClosed);
	}

	onGameError() {
		this.addSimpleMessage(localization.gameError);
	}

	onGameThemes(gameThemes: string[]) {
		this.appDispatch(showGameThemes(gameThemes));
		this.playGameSound(GameSound.GAME_THEMES);

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.gameThemes}: ${gameThemes.join(', ')}`));
		}
	}

	onGameStatistics(statistics: PlayerStatistics[]) {
		const { players } = this.getState().room2.persons;

		// Calculate final scores for sorting and add current scores to statistics
		const enhancedStatistics: PlayerStatistics[] = statistics.filter(stat => stat.name && stat.name !== Constants.ANY_NAME).map(stat => {
			const currentPlayer = players.find(p => p.name === stat.name);
			const currentScore = currentPlayer?.sum ?? undefined;

			return {
				...stat,
				currentScore,
			};
		});

		// Sort players by final score in descending order
		const sortedStatistics = enhancedStatistics.sort((a, b) => (b.currentScore ?? 0) - (a.currentScore ?? 0));

		this.appDispatch(showStatistics(sortedStatistics));

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

	onGameMetadata(
		gameName: string,
		packageName: string,
		contactUri: string,
		voiceChatUri: string | null
	) {
		this.dispatch(roomActionCreators.gameMetadataChanged(gameName, packageName, contactUri, voiceChatUri));
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

	onPackageAuthors(authors: string[]) {
		this.appDispatch(showObject({
			header: '',
			text: authors.join(', '),
			hint: authors.length === 1 ? localization.presents : localization.presentsPlural,
			large: false,
			animate: false,
		}));
	}

	onPackageComments(comments: string) {
		this.appDispatch(captionChanged(localization.packageComments));
		this.appDispatch(showText(comments));
	}

	onPackageDate(packageDate: string) {
		this.appDispatch(addToChat({
			sender: localization.packageDate,
			text: packageDate,
			level: MessageLevel.System,
		}));
	}

	onPackageSources(sources: string[]) {
		this.appDispatch(addToChat({
			sender: localization.packageSources,
			text: sources.join(', '),
			level: MessageLevel.System,
		}));
	}

	onPass(playerIndex: number) {
		this.appDispatch(playerStateChanged({ index: playerIndex, state: PlayerStates.Pass }));
	}

	onPin(pin: string) {
		this.appDispatch(copyToClipboard(pin));
		this.appDispatch(userInfoChanged(localization.pinCopied));
	}

	onPlayerAnswer(playerIndex: number, answer: string) {
		if (this.getState().table.layoutMode === LayoutMode.OverlayPoints) {
			const parts = answer.split(',');

			if (parts.length >= 2) {
				const x = parseFloat(parts[0]);
				const y = parseFloat(parts[1]);

				if (!isNaN(x) && !isNaN(y)) {
					const state = this.getState();
					const player = state.room2.persons.players[playerIndex];
					const label = player ? player.name : undefined;

					this.appDispatch(addPointMarker({ x, y, color: '#FF9030', label }));
					return;
				}
			}
		}

		// this.appDispatch(setPlayerAnswer({ index: playerIndex, answer })); // TODO: think about providing unified answering experience
		this.appDispatch(playerReplicChanged({ playerIndex, replic: answer }));
	}

	onPlayerAppellating(playerName: string) {
		this.addSimpleMessage(stringFormat(localization.requestedAppellation, playerName));

		const state = this.getState();
		const playerIndex = state.room2.persons.players.findIndex(p => p.name === playerName);

		if (playerIndex !== -1) {
			this.appDispatch(setPlayerApellating({ index: playerIndex, isAppellating: true }));
		}
	}

	onPlayerScoreChanged(playerIndex: number, newScore: number) {
		const state = this.getState();

		if (playerIndex < 0 || playerIndex >= state.room2.persons.players.length) {
			return;
		}

		const player = state.room2.persons.players[playerIndex];
		const oldScore = player.sum;

		if (oldScore === newScore) {
			return;
		}

		const showmanName = state.room2.persons.showman.name;

		this.appDispatch(playerSumChanged({ index: playerIndex, value: newScore }));
		this.addSimpleMessage(stringFormat(localization.playerScoreChanged, showmanName, player.name, oldScore.toString(), newScore.toString()));
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

	onRoundAuthors(authors: string[]) {
		this.appDispatch(addToChat({
			sender: localization.roundAuthors,
			text: authors.join(', '),
			level: MessageLevel.System,
		}));
	}

	onRoundComments(comments: string) {
		this.appDispatch(captionChanged(localization.roundComments));
		this.appDispatch(showText(comments));
	}

	onRoundContent(content: string[]) {
		preloadRoundContent(
			content,
			this.preprocessServerUri.bind(this),
			this.isExternalUri.bind(this),
			this.appDispatch,
			this.addSimpleMessage.bind(this)
		);
	}

	onRoundEnd(reason: string) {
		switch (reason) {
			case 'empty':
				this.addSimpleMessage(localization.roundEndedEmpty);
				break;

			case 'timeout':
				this.addSimpleMessage(localization.roundEndedTimeout);
				break;

			case 'manual':
				default:
				this.addSimpleMessage(localization.roundEndedManual);
				break;
		}
	}

	onRoundsNames(roundNames: string[]) {
		this.appDispatch(setRoundsNames(roundNames));
	}

	onRoundSources(sources: string[]) {
		this.appDispatch(addToChat({
			sender: localization.roundSources,
			text: sources.join(', '),
			level: MessageLevel.System,
		}));
	}

	onRoundThemes(roundThemesNames: string[], playMode: ThemesPlayMode) {
		if (playMode !== ThemesPlayMode.OneByOne) {
			const roundThemes: ThemeInfo[] = roundThemesNames.map(t => ({ name: t, comment: '', questions: [] }));
			this.appDispatch(setRoundThemes(roundThemes));
		}

		if (playMode === ThemesPlayMode.AllTogether) {
			this.appDispatch(showThemeStack());
		}

		this.appDispatch(questionReset());
	}

	onRoundThemesComments(comments: string[]) {
		this.appDispatch(setThemesComments(comments));
	}

	onSetAttachContentToTable(attach: boolean) {
		this.appDispatch(setAttachContentToTable(attach));
	}

	onShowmanReplic(messageIndex: number, messageCode: string, args: string[]) {
		const text = localization.getString('replic_' + messageCode.toString());

		if (text) {
			const textVariants = text.split(';');
			const variantIndex = messageIndex % textVariants.length;
			const selectedVariant = stringFormat(textVariants[variantIndex], ...args);
			this.appDispatch(showmanReplicChanged(selectedVariant));
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

		if (stage === GameStage.Round) {
			this.playGameSound(GameSound.ROUND_BEGIN);
			const roundName = stageName;
			this.appDispatch(showObject({ header: localization.round, text: roundName, hint: getRuleString(rules), large: true, animate: false }));
			this.appDispatch(resetQuestionCounter());
			this.appDispatch(clearRoundThemes());

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
		this.appDispatch(setShowMainTimer(false));
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

	onTimerUserPause(timerIndex: number, timerArgument: number) {
		this.appDispatch(pauseTimer({ timerIndex, currentTime: timerArgument, pausedByUser: true }));
	}

	onTimerUserResume(timerIndex: number) {
		this.appDispatch(resumeTimer({ timerIndex, runByUser: true }));
	}

	onValidation(
		header: string,
		name: string,
		answer: string,
		message: string,
		rightAnswers:
		string[],
		wrongAnswers: string[],
		showExtraRightButtons: boolean,
	) {
		this.appDispatch(validate({ header, name, answer, message, rightAnswers, wrongAnswers, showExtraRightButtons }));
	}

	onUnbanned(name: string) {
		this.dispatch(roomActionCreators.unbanned(name));
		this.addSimpleMessage(stringFormat(localization.userUnbanned, name));
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

			case 'replic': {
				const [replic] = content;

				if (replic.type === 'text') {
					this.onReplic('s', replic.value);
				}

				this.appDispatch(switchToContent());
				break;
			}

			case 'background': {
				const [backgroundContent] = content;

				if (backgroundContent.type === 'audio') {
					const uri = this.preprocessServerUri(backgroundContent.value);

					// Check if background audio is external
					if (this.isExternalUri(uri)) {
						this.appDispatch(appendExternalMediaWarning(uri));
					}

					if (this.getState().table.audio === uri) {
						this.appDispatch(clearAudio()); // Forcing audio reload
					}

					this.appDispatch(showBackgroundAudio(uri));
				}
				break;
			}

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

	onOverlayPointsLayout(deviation: number) {
		this.appDispatch(overlayPoints(deviation));
	}

	onAnswerOptionsLayout(questionHasScreenContent: boolean, typeNames: string[], useStackedAnswerLayout: boolean, contentWeight: number) {
		const options: AnswerOption[] = [];
		let hasImageOption = false;

		for (let i = 0; i < typeNames.length; i++) {
			const typeName = typeNames[i];
			const contentType = ContentType[typeName as keyof typeof ContentType];

			options.push({
				label: '',
				state: ItemState.Normal,
				content: { type: contentType, value: '', read: false, partial: false }
			});

			// Check if at least one option contains an image
			if (contentType === ContentType.Image) {
				hasImageOption = true;
			}
		}

		// Calculate options weight based on row count using getBestRowColumnCount
		const { rowCount, columnCount } = getBestRowColumnCount(options.length);

		// Options weight is proportional to row count (like ContentGroup.weight)
		// Use larger weight if options contain at least one image
		const optionsWeight = hasImageOption ? Constants.LARGE_CONTENT_WEIGHT : rowCount;

		this.appDispatch(answerOptions({
			questionHasScreenContent,
			options,
			useStackedAnswerLayout,
			contentWeight,
			optionsWeight,
			optionsRowCount: rowCount,
			optionsColumnCount: columnCount
		}));
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
		this.appDispatch(stopTimer(1));
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
	}

	onTable(table: ThemeInfo[]) {
		this.appDispatch(setRoundThemes(table));
	}

	onShowTable() {
		this.appDispatch(showRoundTable());
		this.appDispatch(stopAudio());
		this.appDispatch(canPressChanged(false));
		this.appDispatch(stopTimer(1));
	}

	onTableCaption(caption: string) {
		this.appDispatch(captionChanged(caption));
	}

	onQuestionSelected(themeIndex: number, questionIndex: number, questionPrice: number) {
		this.initQuestion();
		this.playGameSound(GameSound.QUESTION_SELECTED);

		const state = this.getState();

		const themeInfo = state.table.roundInfo[themeIndex];

		if (themeInfo) {
			this.appDispatch(setTheme({ name: themeInfo.name, comments: themeInfo.comment }));

			if (questionIndex > -1 && questionIndex <= themeInfo.questions.length) {
				const price = questionPrice > -1 ? questionPrice : themeInfo.questions[questionIndex]; // Can be 0
				this.dispatch(roomActionCreators.currentPriceChanged(price));
				this.appDispatch(captionChanged(`${themeInfo.name}, ${price}`));
				this.appDispatch(blinkQuestion({ themeIndex, questionIndex }));

				setTimeout(
					() => {
						this.appDispatch(updateQuestion({ themeIndex, questionIndex, price: -1 }));

						// Call getState() to use actual state
						if (this.getState()?.table.mode === TableMode.RoundTable) {
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

	onTheme(themeName: string, animate: boolean, comments: string, authors: string[], sources: string[]) {
		this.onThemeInfo(themeName, comments);

		if (!animate) {
			// TODO: looks like all this is handled by endquestion message, so we can remove this
			this.appDispatch(playersStateCleared());
			this.appDispatch(showmanReplicChanged(''));
			this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
			this.appDispatch(canPressChanged(false));
			this.appDispatch(stopTimer(1));
		} else {
			this.appDispatch(captionChanged(localization.roundThemes));
			this.playGameSound(GameSound.ROUND_THEMES, true);
			this.appDispatch(addRoundTheme({ name: themeName, comment: comments }));
		}

		this.appDispatch(showObject({ header: animate ? '' : localization.theme, text: themeName, hint: comments, large: false, animate }));

		if (authors.length > 0) {
			this.appDispatch(addToChat({
				sender: localization.themeAuthors,
				text: authors.join(', '),
				level: MessageLevel.System,
			}));
		}

		if (sources.length > 0) {
			this.appDispatch(addToChat({
				sender: localization.themeSources,
				text: sources.join(', '),
				level: MessageLevel.System,
			}));
		}

		if (this.getState().settings.writeGameLog) {
			this.appDispatch(addGameLog(`${localization.theme}: ${themeName}`));
		}
	}

	onThemeInfo(themeName: string, comments: string) {
		this.appDispatch(setTheme({ name: themeName, comments }));
	}

	onQuestion(questionPrice: string) {
		const { theme } = this.getState().room2;
		this.initQuestion();
		this.appDispatch(showObject({ header: theme.name, text: questionPrice, hint: '', large: true, animate: false }));
		this.appDispatch(captionChanged(`${theme.name}, ${questionPrice}`));
		this.dispatch(roomActionCreators.currentPriceChanged(questionPrice));
	}

	onTimerMaximumChanged(timerIndex: number, maximum: number) {
		this.appDispatch(timerMaximumChanged({ timerIndex, maximumTime: maximum }));
	}

	onPlayersVisibilityChanged(isVisible: boolean) {
		this.appDispatch(playersVisibilityChanged(isVisible));
	}

	onTimerRun(timerIndex: number, timerArgument: number, timerPersonIndex: number | null) {
		this.appDispatch(runTimer({ timerIndex, maximumTime: timerArgument, runByUser: false }));

		if (timerIndex === 2 && timerPersonIndex !== null) {
			if (timerPersonIndex === -1) {
				this.appDispatch(activateShowmanDecision());
			} else if (timerPersonIndex === -2) {
				this.appDispatch(setShowMainTimer(true));
			} else if (timerPersonIndex > -1 && timerPersonIndex < this.getState().room2.persons.players.length) {
				this.appDispatch(activatePlayerDecision(timerPersonIndex));
			}
		}
	}

	onTimerPause(timerIndex: number, currentTime: number) {
		this.appDispatch(pauseTimer({ timerIndex, currentTime, pausedByUser: false }));
	}

	onTimerResume(timerIndex: number) {
		this.appDispatch(resumeTimer({ timerIndex, runByUser: false }));
	}

	onTimerStop(timerIndex: number) {
		this.appDispatch(stopTimer(timerIndex));

		if (timerIndex === 2) {
			this.appDispatch(setShowMainTimer(false));
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
				this.playGameSound(GameSound.QUESTION_FOR_ALL);
				text = localization.questionTypeForAll;
				hint = localization.questionTypeForAllHint;
				break;

			case 'stake':
				this.playGameSound(GameSound.QUESTION_STAKE);
				text = localization.questionTypeStake;
				hint = localization.questionTypeStakeHint;
				break;

			case 'stakeAll': // 'forAllWithStake':
				this.playGameSound(GameSound.QUESTION_FOR_ALL_WITH_STAKE);
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
				this.playGameSound(GameSound.QUESTION_FOR_YOURSELF);
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
		if (this.getState().table.layoutMode === LayoutMode.OverlayPoints) {
			const parts = answer.split(',');

			if (parts.length >= 2) {
				const x = parseFloat(parts[0]);
				const y = parseFloat(parts[1]);

				if (!isNaN(x) && !isNaN(y)) {
					this.appDispatch(addPointMarker({ x, y, color: 'rgba(0, 200, 0, 0.35)', isArea: true }));
					this.appDispatch(captionChanged(localization.rightAnswer));

					this.dispatch(roomActionCreators.afterQuestionStateChanged(true));
					this.dispatch(roomActionCreators.hintChanged(null));

					if (this.getState().settings.writeGameLog) {
						this.appDispatch(addGameLog(`${localization.rightAnswer}: ${answer}`));
					}

					return;
				}
			}
		}

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

	onStop() { // Round finished
		this.appDispatch(stopTimer(0));
		this.appDispatch(stopTimer(1));
		this.appDispatch(stopTimer(2));

		this.appDispatch(showLogo());
		this.appDispatch(setShowMainTimer(false));
		this.appDispatch(clearDecisions());

		this.onQuestionEnd(); // TODO: That should be sent by server, but we can call it here to ensure the game state is reset
	}

	onToggle(themeIndex: number, questionIndex: number, price: number) {
		const state = this.getState();
		const themeInfo = state.table.roundInfo[themeIndex];

		if (themeInfo) {
			const existingPrice = themeInfo.questions[questionIndex];

			if (existingPrice) {
				this.appDispatch(updateQuestion({ themeIndex, questionIndex, price }));

				const message = price >= 0
					? stringFormat(localization.questionRestored, state.room2.persons.showman.name, themeInfo.name, price.toString())
					: stringFormat(localization.questionRemoved, state.room2.persons.showman.name, themeInfo.name, existingPrice.toString());

				this.appDispatch(addToChat({
					sender: '',
					text: message,
					level: MessageLevel.System
				}));
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
		const { hostName } = this.getState().room2.persons;

		if (!hostName) {
			return;
		}

		this.addSimpleMessage(stringFormat(localization.addedNewSlot, hostName));
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

		const { hostName } = this.getState().room2.persons;

		if (!hostName) {
			return;
		}

		this.addSimpleMessage(stringFormat(localization.deletedSlot, hostName, (index + 1).toString()));
	}

	onPause(isPaused: boolean, currentTime: number[]) {
		this.appDispatch(setIsPaused(isPaused));

		if (currentTime.length > 2) {
			if (isPaused) {
				this.appDispatch(pauseTimer({ timerIndex: 0, currentTime: currentTime[0], pausedByUser: true }));
				this.appDispatch(pauseTimer({ timerIndex: 1, currentTime: currentTime[1], pausedByUser: true }));
				this.appDispatch(pauseTimer({ timerIndex: 2, currentTime: currentTime[2], pausedByUser: true }));

				this.pauseLoadTimerIfNeeded();
			} else {
				this.appDispatch(resumeTimer({ timerIndex: 0, runByUser: true }));
				this.appDispatch(resumeTimer({ timerIndex: 1, runByUser: true }));
				this.appDispatch(resumeTimer({ timerIndex: 2, runByUser: true }));

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

		const { hostName } = state.room2.persons;

		if (!hostName) {
			return;
		}

		this.addSimpleMessage(stringFormat(
			localization.changedSlotType,
			hostName,
			account.name,
			isHuman ? localization.human : localization.computer));
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

		const { hostName } = state.room2.persons;

		if (!hostName) {
			return;
		}

		this.addSimpleMessage(stringFormat(localization.replacedSlot, hostName, account.name, replacer));
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

		const { hostName } = state.room2.persons;

		if (!hostName) {
			return;
		}

		this.addSimpleMessage(stringFormat(localization.freedSlot, hostName, account.name));
	}

	onSetChooser(chooserIndex: number, setActive: boolean, manually: boolean) {
		this.appDispatch(chooserChanged(chooserIndex));

		const state = this.getState();
		const player = state.room2.persons.players[chooserIndex];

		if (!player) {
			return;
		}

		if (setActive) {
			this.appDispatch(playerStateChanged({ index: chooserIndex, state: PlayerStates.Press }));

			const indices = state.room2.persons.players
				.map((_, i) => i)
				.filter(i => i !== chooserIndex);

			this.appDispatch(playerStatesChanged({ indices, state: PlayerStates.Pass }));
		}

		if (manually) {
			this.appDispatch(addToChat({
				sender: '',
				text: stringFormat(localization.setChooser, state.room2.persons.showman.name, player.name),
				level: MessageLevel.System,
			}));
		}
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

	onMessage(sender: string, text: string): void {
		this.appDispatch(addGameLog(`${sender}: ${text}`));

		if (sender === this.getState().room2.name) {
			return;
		}

		const replic: ChatMessage = {
			sender,
			text,
			level: MessageLevel.Information,
		};

		this.appDispatch(addToChat(replic));
	}

	onSinglePlayerStateChanged(playerIndex: number, state: PlayerStates): void {
		this.appDispatch(playerStateChanged({ index: playerIndex, state }));
	}

	onSinglePlayerStakeChanged(playerIndex: number, stakeType: StakeTypes, stake: number): void {
		const nominal = this.getState().room.stage.currentPrice;
		const playerStake = stakeType === StakeTypes.Nominal ? nominal : stake;
		this.appDispatch(playerStakeChanged({ index: playerIndex, stakeType, stake: playerStake }));
	}
}

