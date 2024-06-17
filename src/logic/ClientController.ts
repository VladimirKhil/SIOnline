import { Action, AnyAction, Dispatch } from 'redux';
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
import commonActionCreators from '../state/common/commonActionCreators';
import localization from '../model/resources/localization';
import uiActionCreators from '../state/ui/uiActionCreators';
import ThemesPlayMode from '../model/enums/ThemesPlayMode';
import TableMode from '../model/enums/TableMode';
import Role from '../model/Role';
import Sex from '../model/enums/Sex';
import RoundRules from '../model/enums/RoundRules';
import { AppDispatch } from '../state/new/store';
import TimerStates from '../model/enums/TimeStates';
import TimerInfo from '../model/TimerInfo';

import { answerOptions,
	appendPartialText,
	blinkQuestion,
	blinkTheme,
	canPressChanged,
	captionChanged,
	endQuestion,
	isSelectableChanged,
	pauseLoadTimer,
	prependTextChanged,
	questionReset,
	removeTheme,
	resumeLoadTimer,
	rightOption,
	setAnswerView,
	showBackgroundAudio,
	showContent,
	showGameThemes,
	showLogo,
	showObject,
	showPartialText,
	showQuestionType,
	showRoundTable,
	showRoundThemes,
	showText,
	startLoadTimer,
	updateOption,
	updateOptionState,
	updateQuestion } from '../state/new/tableSlice';

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

		if (location.protocol === 'https:') {
			return result.replace('http://', 'https://');
		}

		return result;
	}

	private playGameSound(sound: GameSound, loop = false): void {
		const isSoundEnabled = this.getState().settings.appSound;

		if (!isSoundEnabled) {
			return;
		}

		this.dispatch(commonActionCreators.playAudio(sound, loop));
	}

	private onScreenContent(content: ContentInfo[]) {
		const groups: ContentGroup[] = [];
		let group: ContentGroup | null = null;

		let runContentLoadTimer = false;

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
						read: groups.length === 0,
						partial: false,
					});

					groups.push(textGroup);
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

					const state = this.getState();

					if (state.room.stage.isQuestion &&
						!state.table.isAnswer &&
						!state.room.settings.falseStart &&
						state.room.settings.partialImages &&
						state.room.settings.timeSettings.partialImageTime > 0) {
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

	onAvatarChanged(personName: string, contentType: string, uri: string) {
		switch (contentType) {
			case 'image':
				this.dispatch(roomActionCreators.personAvatarChanged(personName, uri));
				break;

			case 'video':
				this.dispatch(roomActionCreators.personAvatarVideoChanged(personName, uri));
				break;

			default:
				break;
		}
	}

	onConnected(account: Account, role: string, index: number) {
		if (account.name === this.getState().room.name) {
			return;
		}

		this.dispatch(roomActionCreators.personAdded(account));

		switch (role) {
			case 'showman':
				this.dispatch(roomActionCreators.showmanChanged(account.name, true, false));
				break;

			case 'player':
				this.dispatch(roomActionCreators.playerChanged(index, account.name, true, false));
				break;

			default:
				break;
		}
	}

	onGameThemes(gameThemes: string[]) {
		this.appDispatch(showGameThemes(gameThemes));
	}

	onOptionChanged(name: string, value: string) {
		const { settings } = this.getState().room;

		switch (name) {
			case 'DisplayAnswerOptionsLabels':
				this.dispatch(roomActionCreators.settingsChanged({
					...settings,
					displayAnswerOptionsLabels: value.toLowerCase() === 'true'
				}));

				break;

			case 'FalseStart':
				this.dispatch(roomActionCreators.settingsChanged({
					...settings,
					falseStart: value.toLowerCase() === 'true'
				}));

			break;

			case 'PartialImages':
				this.dispatch(roomActionCreators.settingsChanged({
					...settings,
					partialImages: value.toLowerCase() === 'true'
				}));

			break;

			case 'PartialImageTime':
				this.dispatch(roomActionCreators.settingsChanged({
					...settings,
					timeSettings: {
						...settings.timeSettings,
						partialImageTime: parseInt(value, 10)
					}
				}));

			break;

			default:
				break;
		}
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
			this.appDispatch(showObject({ header: localization.package, text: packageName, hint: '' }));
		}
	}

	onRoundThemes(roundThemesNames: string[], playMode: ThemesPlayMode) {
		if (playMode === ThemesPlayMode.OneByOne) {
			this.playGameSound(GameSound.ROUND_THEMES, true);
		}

		const roundThemes: ThemeInfo[] = roundThemesNames.map(t => ({ name: t, questions: [] }));

		this.appDispatch(showRoundThemes({
			roundThemes,
			isFinal: playMode === ThemesPlayMode.AllTogether,
			display: playMode !== ThemesPlayMode.None,
		}));

		this.appDispatch(questionReset());
	}

	onStage(stage: string, stageName: string, stageIndex: number, rules: string) {
		const state = this.getState();

		this.dispatch(commonActionCreators.stopAudio());
		this.dispatch(roomActionCreators.stageChanged(stage, stageIndex));

		if (stage !== GameStage.Before) {
			this.dispatch(roomActionCreators.gameStarted(true));
		}

		if (stage === GameStage.Round || stage === GameStage.Final) {
			this.playGameSound(GameSound.ROUND_BEGIN);
			const { roundTail } = localization;
			const roundName = stageName.endsWith(roundTail) ? stageName.substring(0, stageName.length - roundTail.length) : stageName;
			this.appDispatch(showObject({ header: localization.round, text: roundName, hint: getRuleString(rules) }));
			this.dispatch(roomActionCreators.playersStateCleared());

			if (stage === GameStage.Round) {
				for	(let i = 0; i < state.room.persons.players.length; i++) {
					this.dispatch(roomActionCreators.playerInGameChanged(i, true));
				}
			}

			this.appDispatch(captionChanged(''));
		} else if (stage === GameStage.Begin || stage === GameStage.After) {
			this.appDispatch(showLogo());
			this.appDispatch(captionChanged(stage === GameStage.Begin ? localization.gameStarted : localization.gameFinished));
		}

		this.dispatch(roomActionCreators.gameStateCleared());
		this.appDispatch(isSelectableChanged(false));
		this.appDispatch(canPressChanged(false));
	}

	onStageInfo(stage: string, _stageName: string, stageIndex: number) {
		this.dispatch(roomActionCreators.stageChanged(stage, stageIndex));

		if (stage !== GameStage.Before) {
			this.dispatch(roomActionCreators.gameStarted(true));
		}

		if (stage === GameStage.After) {
			this.appDispatch(showLogo());
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
				break;

			case 'background':
				const backgroundContent = content[0];

				if (backgroundContent.type === 'audio') {
					const uri = this.preprocessServerUri(backgroundContent.value);
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
	}

	onThemeComments(themeComments: string) {
		this.appDispatch(prependTextChanged(themeComments));
	}

	onRightAnswerStart(rightAnswer: string) {
		this.appDispatch(setAnswerView(rightAnswer));
	}

	onContentAppend(placement: string, layoutId: string, contentType: string, contentValue: string) {
		this.appDispatch(appendPartialText(contentValue));
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
		this.dispatch(roomActionCreators.playerStateChanged(index, PlayerStates.Press));
		this.pauseLoadTimerIfNeeded();
	}

	onEndPressButtonByTimeout() {
		this.appDispatch(canPressChanged(false));
		this.dispatch(roomActionCreators.stopTimer(1));
		this.playGameSound(GameSound.QUESTION_NOANSWERS);
	}

	onReplic(personCode: string, text: string) {
		if (personCode === 's') {
			this.dispatch(roomActionCreators.showmanReplicChanged(text));
			return;
		}

		if (personCode.startsWith('p') && personCode.length > 1) {
			const index = parseInt(personCode.substring(1), 10);
			this.dispatch(roomActionCreators.playerReplicChanged(index, text));
			return;
		}

		if (personCode !== 'l') {
			return;
		}

		this.dispatch(roomActionCreators.chatMessageAdded({ sender: null, text, level: MessageLevel.System }) as unknown as Action);
	}

	onTable(table: ThemeInfo[], isFinal: boolean) {
		this.appDispatch(showRoundThemes({ roundThemes: table, isFinal, display: false }));
	}

	onShowTable() {
		this.appDispatch(showRoundTable());
		this.dispatch(commonActionCreators.stopAudio());
		this.appDispatch(canPressChanged(false));
		this.dispatch(roomActionCreators.stopTimer(1));
	}

	onTableCaption(caption: string) {
		this.appDispatch(captionChanged(caption));
	}

	onQuestionSelected(themeIndex: number, questionIndex: number) {
		this.dispatch(roomActionCreators.playersStateCleared());
		this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
		this.appDispatch(questionReset());

		const themeInfo = this.getState().table.roundInfo[themeIndex];

		if (themeInfo) {
			const price = themeInfo.questions[questionIndex];

			if (price) {
				this.dispatch(roomActionCreators.currentPriceChanged(price));
				this.appDispatch(captionChanged(`${themeInfo.name}, ${price}`));
				this.appDispatch(blinkQuestion({ themeIndex, questionIndex }));

				setTimeout(
					() => {
						this.appDispatch(updateQuestion({ themeIndex, questionIndex, price: -1 }));

						if (this.getState().table.mode === TableMode.RoundTable) {
							this.appDispatch(showObject({ header: themeInfo.name, text: price.toString(), hint: '' }));
						}
					},
					500
				);
			}
		}
	}

	onTheme(themeName: string) {
		this.dispatch(roomActionCreators.playersStateCleared());
		this.dispatch(roomActionCreators.showmanReplicChanged(''));
		this.appDispatch(showObject({ header: localization.theme, text: themeName, hint: '' }));
		this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
		this.dispatch(roomActionCreators.themeNameChanged(themeName));
		this.appDispatch(canPressChanged(false));
		this.dispatch(roomActionCreators.stopTimer(1));
	}

	onQuestion(questionPrice: string) {
		const { themeName } = this.getState().room.stage;
		this.dispatch(roomActionCreators.playersStateCleared());
		this.dispatch(roomActionCreators.afterQuestionStateChanged(false));
		this.appDispatch(showObject({ header: themeName, text: questionPrice, hint: '' }));
		this.appDispatch(captionChanged(`${themeName}, ${questionPrice}`));
		this.appDispatch(questionReset());
	}

	onTimerMaximumChanged(timerIndex: number, maximum: number) {
		this.dispatch(roomActionCreators.timerMaximumChanged(timerIndex, maximum));
	}

	onPlayersVisibilityChanged(isVisible: boolean) {
		this.dispatch(uiActionCreators.playersVisibilityChanged(isVisible));
	}

	onTimerRun(timerIndex: number, timerArgument: number, timerPersonIndex: number | null) {
		this.dispatch(roomActionCreators.runTimer(timerIndex, timerArgument, false));

		if (timerIndex === 2 && timerPersonIndex !== null) {
			if (timerPersonIndex === -1) {
				this.dispatch(roomActionCreators.activateShowmanDecision());
			} else if (timerPersonIndex === -2) {
				this.dispatch(roomActionCreators.showMainTimer());
			} else if (timerPersonIndex > -1 && timerPersonIndex < this.getState().room.persons.players.length) {
				this.dispatch(roomActionCreators.activatePlayerDecision(timerPersonIndex));
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
			this.dispatch(commonActionCreators.stopAudio());
		}
	}

	onQuestionType(qType: string) {
		switch (qType) {
			case 'stake':
				this.playGameSound(GameSound.QUESTION_STAKE);

				this.appDispatch(showQuestionType({
					header: localization.question,
					text: localization.questionTypeStake,
					hint: localization.questionTypeStakeHint,
				}));

				break;

			case 'secret':
			case 'secretPublicPrice':
			case 'secretNoQuestion':
				this.playGameSound(GameSound.QUESTION_SECRET);

				this.appDispatch(showQuestionType({
					header: localization.question,
					text: localization.questionTypeSecret,
					hint: localization.questionTypeSecretHint,
				}));

				this.appDispatch(questionReset());
				break;

			case 'noRisk':
				this.playGameSound(GameSound.QUESTION_NORISK);

				this.appDispatch(showQuestionType({
					header: localization.question,
					text: localization.questionTypeNoRisk,
					hint: localization.questionTypeNoRiskHint,
				}));

				break;

			default:
				break;
		}

		this.dispatch(roomActionCreators.isQuestionChanged(true));
	}

	onThemeDeleted(themeIndex: number) {
		const themeInfo = this.getState().table.roundInfo[themeIndex];

		if (!themeInfo) {
			return;
		}

		this.playGameSound(GameSound.FINAL_DELETE);
		this.appDispatch(blinkTheme(themeIndex));

		setTimeout(
			() => {
				this.appDispatch(removeTheme(themeIndex));
			},
			600
		);
	}

	onRightAnswer(answer: string) {
		if (this.getState().table.layoutMode === LayoutMode.Simple) {
			this.appDispatch(showText(answer));
			this.appDispatch(captionChanged(localization.rightAnswer));
		} else {
			this.appDispatch(rightOption(answer));
		}

		this.dispatch(roomActionCreators.afterQuestionStateChanged(true));
	}

	onChoose() {
		this.dispatch(roomActionCreators.decisionNeededChanged(true));
		this.appDispatch(isSelectableChanged(true));
	}

	onStop() {
		this.dispatch(roomActionCreators.stopTimer(0));
		this.dispatch(roomActionCreators.stopTimer(1));
		this.dispatch(roomActionCreators.stopTimer(2));

		this.appDispatch(showLogo());
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
		this.dispatch(roomActionCreators.isQuestionChanged(false));
		this.appDispatch(endQuestion());
	}

	addPlayerTable() {
		this.dispatch(roomActionCreators.playerAdded());
	}

	deletePlayerTable(index: number) {
		const state = this.getState();
		const player = state.room.persons.players[index];
		const person = state.room.persons.all[player.name];

		this.dispatch(roomActionCreators.playerDeleted(index));

		if (person && !person.isHuman) {
			this.dispatch(roomActionCreators.personRemoved(person.name));
		} else if (player.name === state.room.name) {
			this.dispatch(roomActionCreators.roleChanged(Role.Viewer));
		}
	}

	onPause(isPaused: boolean, currentTime: number[]) {
		this.dispatch(roomActionCreators.isPausedChanged(isPaused));

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
			const allTime = state.room.settings.timeSettings.partialImageTime * 1000;
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
			const allTime = state.room.settings.timeSettings.partialImageTime * 1000;
			const passedTime = loadTimer.value * allTime / loadTimer.maximum;
			this.loadStart = new Date(new Date().getTime() - passedTime);
			this.appDispatch(resumeLoadTimer());
		}
	}

	onTableChangeType(personType: string, index: number, isHuman: boolean, name: string, sex: Sex) {
		const state = this.getState();
		const isPlayer = personType === 'player';
		const account = isPlayer ? state.room.persons.players[index] : state.room.persons.showman;
		const person = state.room.persons.all[account.name];

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

			this.dispatch(roomActionCreators.personAdded(newAccount));
		}

		this.dispatch(isPlayer
			? roomActionCreators.playerChanged(index, name, isHuman, false)
			: roomActionCreators.showmanChanged(name, isHuman, false));

		if (isHuman) {
			this.dispatch(roomActionCreators.personRemoved(person.name));
		}

		if (person && person.name === state.room.name) {
			this.dispatch(roomActionCreators.roleChanged(Role.Viewer));
		}
	}

	onTableSet(role: string, index: number, replacer: string, replacerSex: Sex) {
		const state = this.getState();
		const isPlayer = role === 'player';
		const account = isPlayer ? state.room.persons.players[index] : state.room.persons.showman;
		const person = state.room.persons.all[account.name];

		if (person && !person.isHuman) {
			this.dispatch(isPlayer
				? roomActionCreators.playerChanged(index, replacer, null, false)
				: roomActionCreators.showmanChanged(replacer, null, false));

				this.dispatch(roomActionCreators.personRemoved(person.name));

			const newAccount: Account = {
				name: replacer,
				isHuman: false,
				sex: replacerSex,
				avatar: null
			};

			this.dispatch(roomActionCreators.personAdded(newAccount));
			return;
		}

		if (state.room.persons.showman.name === replacer) { // isPlayer
			this.dispatch(roomActionCreators.showmanChanged(account.name, true, account.isReady));
			this.dispatch(roomActionCreators.playerChanged(index, replacer, true, state.room.persons.showman.isReady));

			if (account.name === state.room.name) {
				this.dispatch(roomActionCreators.roleChanged(Role.Showman));
			} else if (replacer === state.room.name) {
				this.dispatch(roomActionCreators.roleChanged(Role.Player));
			}

			return;
		}

		for (let i = 0; i < state.room.persons.players.length; i++) {
			if (state.room.persons.players[i].name === replacer) {
				if (isPlayer) {
					this.dispatch(roomActionCreators.playersSwap(index, i));
				} else {
					const { isReady } = state.room.persons.players[i];

					this.dispatch(roomActionCreators.playerChanged(i, account.name, null, account.isReady));
					this.dispatch(roomActionCreators.showmanChanged(replacer, null, isReady));

					if (state.room.persons.showman.name === state.room.name) {
						this.dispatch(roomActionCreators.roleChanged(Role.Player));
					} else if (replacer === state.room.name) {
						this.dispatch(roomActionCreators.roleChanged(Role.Showman));
					}
				}

				return;
			}
		}

		this.dispatch(isPlayer
			? roomActionCreators.playerChanged(index, replacer, null, false)
			: roomActionCreators.showmanChanged(replacer, null, false));

		if (account.name === state.room.name) {
			this.dispatch(roomActionCreators.roleChanged(Role.Viewer));
		} else if (replacer === state.room.name) {
			this.dispatch(roomActionCreators.roleChanged(isPlayer ? Role.Player : Role.Showman));
		}
	}

	onTableFree(personType: string, index: number) {
		const state = this.getState();
		const isPlayer = personType === 'player';

		this.dispatch(isPlayer
			? roomActionCreators.playerChanged(index, Constants.ANY_NAME, null, false)
			: roomActionCreators.showmanChanged(Constants.ANY_NAME, null, false));

		const account = isPlayer ? state.room.persons.players[index] : state.room.persons.showman;

		if (account.name === state.room.name) {
			this.dispatch(roomActionCreators.roleChanged(Role.Viewer));
		}
	}

	onSetChooser(chooserIndex: number, setActive: boolean) {
		this.dispatch(roomActionCreators.chooserChanged(chooserIndex));

		if (setActive) {
			this.dispatch(roomActionCreators.playerStateChanged(chooserIndex, PlayerStates.Press));
		}
	}

	onSum(playerIndex: number, value: number) {
		this.dispatch(roomActionCreators.playerSumChanged(playerIndex, value));
	}

	onSums(sums: number[]) {
		this.dispatch(roomActionCreators.sumsChanged(sums));
	}

	onPerson(playerIndex: number, isRight: boolean) {
		const state = this.getState();

		if (playerIndex > -1 && playerIndex < state.room.persons.players.length) {
			this.dispatch(roomActionCreators.playerStateChanged(playerIndex, isRight ? PlayerStates.Right : PlayerStates.Wrong));

			const rightApplause = state.room.stage.currentPrice >= 2000
				? GameSound.APPLAUSE_BIG
				: GameSound.APPLAUSE_SMALL;

			this.playGameSound(isRight ? rightApplause : GameSound.ANSWER_WRONG);
		}
	}

	onFinalThink() {
		this.playGameSound(GameSound.FINAL_THINK, true);
	}
}