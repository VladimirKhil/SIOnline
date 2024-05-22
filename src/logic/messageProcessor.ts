import { Action, ActionCreator, AnyAction, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import Message from '../client/contracts/Message';
import State from '../state/State';
import DataContext from '../model/DataContext';
import * as RoomActions from '../state/room/RoomActions';
import ChatMessage from '../model/ChatMessage';
import roomActionCreators from '../state/room/roomActionCreators';
import Account from '../model/Account';
import Sex from '../model/enums/Sex';
import PlayerStates from '../model/enums/PlayerStates';
import tableActionCreators from '../state/table/tableActionCreators';
import ThemeInfo from '../model/ThemeInfo';
import PersonInfo from '../model/PersonInfo';
import Persons from '../model/Persons';
import PlayerInfo from '../model/PlayerInfo';
import Constants from '../model/enums/Constants';
import Role from '../model/Role';
import localization from '../model/resources/localization';
import StakeTypes from '../model/enums/StakeTypes';
import stringFormat, { trimLength } from '../utils/StringHelpers';
import actionCreators from './actionCreators';
import MessageLevel from '../model/enums/MessageLevel';
import GameMessages from '../client/game/GameMessages';
import JoinMode from '../client/game/JoinMode';
import { getMeAsPlayer } from '../utils/StateHelpers';
import StakeTypes2, { parseStakeTypesFromString } from '../client/game/StakeTypes';
import LayoutMode from '../model/enums/LayoutMode';
import ClientController from './ClientController';
import ContentInfo from '../model/ContentInfo';
import ItemState from '../model/enums/ItemState';
import GameSound from '../model/enums/GameSound';
import commonActionCreators from '../state/common/commonActionCreators';
import clearUrls from '../utils/clearUrls';
import ThemesPlayMode from '../model/enums/ThemesPlayMode';

const MAX_APPEND_TEXT_LENGTH = 150;

function unescapeNewLines(value: string): string {
	return value.replaceAll('\\n', '\n').replaceAll('\\\\', '\\');
}

export default function messageProcessor(controller: ClientController, dispatch: Dispatch<AnyAction>, message: Message) {
	if (message.IsSystem) {
		dispatch((processSystemMessage(controller, message) as object) as AnyAction);
		return;
	}

	dispatch((userMessageReceived(message) as object) as AnyAction);
}

const processSystemMessage: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (controller: ClientController, message: Message) =>
	(dispatch: Dispatch<RoomActions.KnownRoomAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const { role } = state.room;
		const args = message.Text.split('\n');

		viewerHandler(controller, dispatch, state, dataContext, args);

		if (role === Role.Player) {
			playerHandler(controller, dispatch, state, dataContext, args);
		} else if (role === Role.Showman) {
			showmanHandler(controller, dispatch, state, dataContext, args);
		}
	};

const userMessageReceived: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (message: Message) =>
	(dispatch: Dispatch<any>, getState: () => State) => {
		if (message.Sender === getState().room.name) {
			return;
		}

		const replic: ChatMessage = {
			sender: message.Sender,
			text: message.Text,
			level: MessageLevel.Information,
		};

		dispatch(roomActionCreators.chatMessageAdded(replic));
	};

function onReady(personName: string, isReady: boolean, dispatch: Dispatch<any>, state: State): void {
	let personIndex: number;

	if (personName === state.room.persons.showman.name) {
		personIndex = -1;
	} else {
		personIndex = state.room.persons.players.findIndex(p => p.name === personName);
		if (personIndex === -1) {
			return;
		}
	}

	dispatch(roomActionCreators.isReadyChanged(personIndex, isReady));
}

function onConfig(controller: ClientController, ...args: string[]) {
	switch (args[1]) {
		case 'ADDTABLE':
			controller.addPlayerTable();
			break;

		case 'FREE': {
			const role = args[2];
			const index = parseInt(args[3], 10);

			controller.onTableFree(role, index);
			break;
		}

		case 'DELETETABLE': {
			const index = parseInt(args[2], 10);
			controller.deletePlayerTable(index);
			break;
		}

		case 'SET': {
			const role = args[2];
			const index = parseInt(args[3], 10);
			const replacer = args[4];
			const replacerSex = args[5] === '+' ? Sex.Male : Sex.Female;

			controller.onTableSet(role, index, replacer, replacerSex);
			break;
		}

		case 'CHANGETYPE': {
			const role = args[2];
			const index = parseInt(args[3], 10);
			const isHuman = args[4] === '+';
			const name = args[5];
			const sex = args[6] === '+' ? Sex.Male : Sex.Female;

			controller.onTableChangeType(role, index, isHuman, name, sex);
			break;
		}

		default:
			break;
	}
}

const viewerHandler = (controller: ClientController, dispatch: Dispatch<any>, state: State, dataContext: DataContext, args: string[]) => {
	switch (args[0]) {
		case GameMessages.Ads:
			if (args.length === 1) {
				break;
			}

			let ads = args[1];

			if (dataContext.config.clearUrls) {
				ads = clearUrls(ads);
			}

			dispatch(tableActionCreators.showText(ads, false));
			break;

		case 'APELLATION_ENABLES':
			if (args.length === 1) {
				break;
			}

			dispatch(roomActionCreators.areApellationsEnabledChanged(args[1] === '+'));
			break;

		case GameMessages.AtomHint:
			// TODO
			break;

		case GameMessages.Avatar: {
			if (args.length < 4) {
				break;
			}

			const personName = args[1];
			const contentType = args[2];
			const uri = controller.preprocessServerUri(args[3]);

			controller.onAvatarChanged(personName, contentType, uri);
			break;
		}

		case GameMessages.Banned:
			if (args.length < 3) {
				break;
			}

			dispatch(roomActionCreators.banned(args[1], args[2]));
			break;

		case GameMessages.BannedList:
			const bannedList: Record<string, string> = {};

			for (let i = 1; i < args.length - 1; i += 2) {
				bannedList[args[i]] = args[i + 1];
			}

			dispatch(roomActionCreators.bannedListChanged(bannedList));
			break;

		case 'BUTTON_BLOCKING_TIME':
			if (args.length === 1) {
				break;
			}

			dispatch(roomActionCreators.buttonBlockingTimeChanged(parseInt(args[1], 10)));
			break;

		case GameMessages.Choice:
			{
				if (args.length < 3) {
					return;
				}

				const themeIndex = parseInt(args[1], 10);
				const questIndex = parseInt(args[2], 10);

				controller.onQuestionSelected(themeIndex, questIndex);
			}
			break;

		case GameMessages.Config:
			onConfig(controller, ...args);
			break;

		case GameMessages.Connected: {
			const name = args[3];
			const role = args[1];
			const index = parseInt(args[2], 10);
			const isMale = args[4] === 'm';

			const account: Account = {
				name,
				sex: isMale ? Sex.Male : Sex.Female,
				isHuman: true,
				avatar: null
			};

			controller.onConnected(account, role, index);
			break;
		}

		case GameMessages.Content:
			if (args.length < 5) {
				return;
			}

			const placement = args[1];
			const { layoutMode, answerOptions } = state.table;
			const content: ContentInfo[] = [];

			for (let i = 2; i + 2 < args.length; i++) {
				const layoutId = parseInt(args[i], 10);

				if (layoutId === 0) {
					content.push({
						type: args[i + 1],
						value: args[i + 1] === 'text' ? unescapeNewLines(args[i + 2]) : args[i + 2]
					});

					i += 2;
				} else if (layoutMode === LayoutMode.AnswerOptions && i + 3 < args.length && layoutId - 1 < answerOptions.length) {
					const label = args[i + 1];
					const contentType = args[i + 2];
					const contentValue = args[i + 3];

					if (contentType === 'text' || contentType === 'image') {
						controller.onAnswerOption(
							layoutId - 1,
							label,
							contentType,
							contentValue
						);
					}

					i += 3;
				}
			}

			if (content.length === 0) {
				return;
			}

			controller.onContent(placement, content);
			break;

		case GameMessages.ContentAppend: {
			if (args.length < 5) {
				return;
			}

			const placement = args[1];
			const layoutId = args[2];
			const contentType = args[3];
			const contentValue = args[4];

			if (placement !== 'screen' || layoutId !== '0' || contentType !== 'text') {
				return;
			}

			const text = unescapeNewLines(contentValue);
			controller.onContentAppend(placement, layoutId, contentType, text);
			break;
		}

		case GameMessages.ContentShape:
			if (args.length < 5) {
				return;
			}

			const text = unescapeNewLines(args[4]);
			controller.onContentShape(text);
			break;

		case GameMessages.ContentState: {
			if (args.length < 4) {
				return;
			}

			const placement = args[1];
			const layoutId = parseInt(args[2], 10);
			const itemState = ItemState[args[3] as keyof typeof ItemState];
			controller.onContentState(placement, layoutId, itemState);
			break;
		}

		case 'DISCONNECTED':
			disconnected(dispatch, state, ...args);
			break;

		case GameMessages.EndTry: {
			const index = (Number)(args[1]);

			if (!isNaN(index) && index > -1 && index < state.room.persons.players.length) {
				controller.onEndPressButtonByPlayer(index);
			} else if (args[1] === 'A') { // This is ENDTRY for All
				controller.onEndPressButtonByTimeout();
			}
			break;
		}

		case 'FALSESTART':
			// Not used - game button is always available
			break;

		case 'FINALROUND':
			const playersLength = state.room.persons.players.length;

			for (let i = 1; i < Math.min(args.length, playersLength + 1); i++) {
				dispatch(roomActionCreators.playerInGameChanged(i - 1, args[i] === '+'));
			}

			dispatch(roomActionCreators.afterQuestionStateChanged(false));
			break;

		case 'FINALTHINK':
			playGameSound(dispatch, state.settings.appSound, GameSound.FINAL_THINK, true);
			break;

		case GameMessages.GameMetadata:
			{
				if (args.length < 4) {
					break;
				}

				dispatch(roomActionCreators.gameMetadataChanged(args[1], args[2], args[3], args.length > 4 ? args[4] : null));
			}
			break;

		case GameMessages.GameThemes:
			controller.onGameThemes(args.slice(1));
			break;

		case 'HOSTNAME':
			if (args.length > 1) {
				dispatch(roomActionCreators.hostNameChanged(args[1]));

				if (args.length > 2) {
					const changeSource = args[2].length > 0 ? args[2] : localization.byGame;

					dispatch(roomActionCreators.chatMessageAdded({
						sender: '',
						text: stringFormat(localization.hostNameChanged, changeSource, args[1]),
						level: MessageLevel.System,
					}));
				}
			}
			break;

		case 'INFO2':
			info(dispatch, ...args);
			break;

		case GameMessages.Layout:
			if (args.length < 5) {
				return;
			}

			if (args[1] !== 'ANSWER_OPTIONS') {
				return;
			}

			const questionHasScreenContent = args[2] === '+';
			controller.onAnswerOptionsLayout(questionHasScreenContent, args.slice(3));
			break;

		case GameMessages.MediaLoaded:
			if (args.length < 2) {
				break;
			}

			const { players } = state.room.persons;

			for (let i = 0; i < players.length; i++) {
				if (players[i].name === args[1]) {
					dispatch(roomActionCreators.playerMediaLoaded(i));
					break;
				}
			}

			break;

		case GameMessages.Out:
			if (args.length > 1) {
				const themeIndex = parseInt(args[1], 10);
				controller.onThemeDeleted(themeIndex);
			}
			break;

		case 'PASS':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.room.persons.players.length) {
					dispatch(roomActionCreators.playerStateChanged(playerIndex, PlayerStates.Pass));
				}
			}
			break;

		case GameMessages.Pause:
			const isPaused = args[1] === '+';
			controller.onPause(isPaused, args.slice(2).map(v => parseInt(v, 10)));
			break;

		case 'PERSON':
			{
				const isRight = args[1] === '+';
				const index = parseInt(args[2], 10);

				if (index > -1 && index < state.room.persons.players.length) {
					dispatch(roomActionCreators.playerStateChanged(index, isRight ? PlayerStates.Right : PlayerStates.Wrong));

					const rightApplause = state.room.stage.currentPrice >= 2000
						? GameSound.APPLAUSE_BIG
						: GameSound.APPLAUSE_SMALL;

					playGameSound(dispatch, state.settings.appSound, isRight ? rightApplause : GameSound.ANSWER_WRONG);
				}
			}
			break;

		case 'PERSONAPELLATED':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.room.persons.players.length) {
					dispatch(roomActionCreators.playerStateChanged(playerIndex, PlayerStates.HasAnswered));
				}
			}
			break;

		case 'PERSONFINALANSWER':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.room.persons.players.length) {
					dispatch(roomActionCreators.playerStateChanged(playerIndex, PlayerStates.HasAnswered));
				}
			}
			break;

		case 'PERSONFINALSTAKE':
			{
				const playerIndex = parseInt(args[1], 10);
				const player = state.room.persons.players[playerIndex];

				if (!player) {
					break;
				}

				dispatch(roomActionCreators.playerStakeChanged(playerIndex, Constants.HIDDEN_STAKE));
			}
			break;

		case 'PERSONSTAKE':
			{
				const playerIndex = parseInt(args[1], 10);
				const player = state.room.persons.players[playerIndex];

				if (!player) {
					break;
				}

				const stakeType = parseInt(args[2], 10) as StakeTypes;
				let stake = 0;

				switch (stakeType) {
					case StakeTypes.Nominal:
						stake = state.room.stage.currentPrice;
						break;

					case StakeTypes.Sum:
						stake = parseInt(args[3], 10);
						break;

					case StakeTypes.Pass:
						stake = 0;
						break;

					case StakeTypes.AllIn:
						stake = player.sum;
						break;

					default:
						break;
				}

				dispatch(roomActionCreators.playerStakeChanged(playerIndex, stake));
			}
			break;

		case 'PICTURE': {
			const personName = args[1];
			const uri = controller.preprocessServerUri(args[2]);

			dispatch(roomActionCreators.personAvatarChanged(personName, uri));
			break;
		}

		case GameMessages.QType:
			if (args.length > 1) {
				controller.onQuestionType(args[1]);
			}
			break;

		case GameMessages.Question:
			if (args.length > 1) {
				controller.onQuestion(args[1]);
			}
			break;

		case GameMessages.QuestionCaption:
			if (args.length > 1) {
				controller.onTableCaption(args[1]);
			}
			break;

		case GameMessages.QuestionEnd:
			controller.onQuestionEnd();
			break;

		case 'READINGSPEED':
			if (args.length < 2) {
				break;
			}

			dispatch(roomActionCreators.readingSpeedChanged(parseInt(args[1], 10)));
			break;

		case 'READY':
			if (args.length < 2) {
				break;
			}

			onReady(args[1], args.length < 3 || args[2] === '+', dispatch, state);
			break;

		case GameMessages.Replic: {
			if (args.length < 3) {
				break;
			}

			const personCode = args[1];
			let text = '';

			for (let i = 2; i < args.length; i++) {
				if (text.length > 0) {
					text += ' ';
				}

				text += args[i];
			}

			if (dataContext.config.clearUrls) {
				text = clearUrls(text);
			}

			controller.onReplic(personCode, text);
			break;
		}

		case 'RESUME':
			dispatch(tableActionCreators.resumeMedia());
			break;

		case GameMessages.RightAnswer:
			if (args.length > 2) {
				controller.onRightAnswer(args[2]);
			}
			break;

		case GameMessages.RightAnswerStart:
			if (args.length > 2) {
				const answer = trimLength(unescapeNewLines(args[2]), MAX_APPEND_TEXT_LENGTH);
				controller.onRightAnswerStart(answer);
				dispatch(tableActionCreators.captionChanged(localization.rightAnswer));
			}
			break;

		case 'ROUNDCONTENT':
			// Clearing old preloads
			// for (let i = 0; i < document.head.children.length; i++) {
			// 	const child = document.head.children[i];
			// 	if (child.tagName.toLowerCase() === 'link') {
			// 		if (child.attributes.getNamedItem('rel')?.value === 'preload') {
			// 			document.head.removeChild(child);
			// 			i = i - 1;
			// 		}
			// 	}
			// }

			args.slice(1).forEach(url => {
				const contentUri = controller.preprocessServerUri(url);

				// Straight but working method
				// TODO: await
				fetch(contentUri)
					.then(response => {
						if (!response.ok) {
							dispatch(roomActionCreators.chatMessageAdded({
								sender: '',
								text: response.statusText,
								level: MessageLevel.System,
							}));
						}
					})
					.catch((e : TypeError) => {
						console.error(url + ' ' + e.message);
					});

				// Chrome does not support audio and video preload
				// We can return to this method later
				// const link = document.createElement('link');
				// link.setAttribute('rel', 'preload');
				// link.setAttribute('as', 'image');
				// link.setAttribute('href', uri);

				// document.head.appendChild(link);
			});
			break;

		case 'ROUNDSNAMES':
			dispatch(roomActionCreators.roundsNamesChanged(args.slice(1)));
			break;

		case GameMessages.RoundThemes: {
			const printThemes = args[1] === '+';
			const roundThemes: string[] = [];

			for (let i = 2; i < args.length; i++) {
				roundThemes.push(args[i]);
			}

			controller.onRoundThemes(
				roundThemes,
				printThemes ? (state.room.stage.name !== 'Final' ? ThemesPlayMode.OneByOne : ThemesPlayMode.AllTogether) : ThemesPlayMode.None);

			break;
		}

		case 'SETCHOOSER':
			const chooserIndex = parseInt(args[1], 10);
			dispatch(roomActionCreators.chooserChanged(chooserIndex));

			if (args.length > 2) {
				dispatch(roomActionCreators.playerStateChanged(chooserIndex, PlayerStates.Press));
			}
			break;

		case GameMessages.SetJoinMode:
			if (args.length < 2) {
				break;
			}

			const joinMode = JoinMode[args[1] as keyof typeof JoinMode];

			if (joinMode === undefined) {
				break;
			}

			dispatch(roomActionCreators.joinModeChanged(joinMode));
			break;

		case GameMessages.ShowTable:
			controller.onShowTable();
			break;

		case GameMessages.Stage: {
			const stage = args[1];
			const stageName = args[2];
			const stageIndex = args.length > 3 ? parseInt(args[3], 10) : -1;
			controller.onStage(stage, stageName, stageIndex);
			break;
		}

		case GameMessages.StageInfo: {
			const stage = args[1];
			const stageName = args[2];
			const stageIndex = args.length > 3 ? parseInt(args[3], 10) : -1;
			controller.onStageInfo(stage, stageName, stageIndex);
			break;
		}

		case GameMessages.Stop:
			controller.onStop();
			break;

		case 'SUMS':
			const max = Math.min(args.length - 1, Object.keys(state.room.persons.players).length);
			const sums: number[] = [];
			for (let i = 0; i < max; i++) {
				sums.push(parseInt(args[i + 1], 10));
			}

			dispatch(roomActionCreators.sumsChanged(sums));
			break;

		case GameMessages.Table:
			const { roundInfo } = state.table;
			const areQuestionsFilled = roundInfo.some(theme => theme.questions.length > 0);

			if (areQuestionsFilled) {
				break;
			}

			let index = 1;
			const newRoundInfo: ThemeInfo[] = [];
			let maxQuestionsInTheme = 0;

			for (let i = 0; i < roundInfo.length; i++) {
				if (index === args.length) {
					break;
				}

				const questions: number[] = [];

				while (index < args.length && args[index].length > 0) { // empty argument separates themes
					questions.push(parseInt(args[index++], 10));
				}

				maxQuestionsInTheme = Math.max(maxQuestionsInTheme, questions.length);

				const newTheme: ThemeInfo = { name: roundInfo[i].name, questions };
				newRoundInfo.push(newTheme);

				index++;
			}

			// Align number of questions in each theme
			newRoundInfo.forEach((themeInfo) => {
				const questionsCount = themeInfo.questions.length;

				for (let i = 0; i < maxQuestionsInTheme - questionsCount; i++) {
					themeInfo.questions.push(-1);
				}
			});

			controller.onTable(newRoundInfo, state.room.stage.name === 'Final');
			break;

		case 'TIMEOUT':
			playGameSound(dispatch, state.settings.appSound, GameSound.ROUND_TIMEOUT);
			break;

		case GameMessages.Timer:
			// Special case for automatic game
			if (!state.room.stage.isGameStarted
				&& state.game.isAutomatic
				&& args.length === 5
				&& args[1] === '2'
				&& args[2] === 'GO'
				&& args[4] === '-2') {
				const leftSeconds = parseInt(args[3], 10) / 10;
				roomActionCreators.showLeftSeconds(leftSeconds, dispatch);
			} else if (args.length > 2) {
				const timerIndex = parseInt(args[1], 10);
				const timerCommand = args[2];
				const timerArgument = args.length > 3 ? parseInt(args[3], 10) : 0;
				const timerPersonIndex = args.length > 4 ? parseInt(args[4], 10) : null;

				switch (timerCommand) {
					case 'GO':
						controller.onTimerRun(timerIndex, timerArgument, timerPersonIndex);
						break;

					case 'STOP':
						controller.onTimerStop(timerIndex);
						break;

					case 'PAUSE':
						controller.onTimerPause(timerIndex, timerArgument);
						break;

					case 'USER_PAUSE':
						dispatch(roomActionCreators.pauseTimer(timerIndex, timerArgument, true));
						break;

					case 'RESUME':
						controller.onTimerResume(timerIndex);
						break;

					case 'USER_RESUME':
						dispatch(roomActionCreators.resumeTimer(timerIndex, true));
						break;

					case 'MAXTIME':
						controller.onTimerMaximumChanged(timerIndex, timerArgument);
						break;

					default:
						break;
				}
			}
			break;

		case GameMessages.Theme:
			if (args.length > 1) {
				controller.onTheme(args[1]);
			}
			break;

		case GameMessages.ThemeComments:
			if (args.length > 1) {
				const comments = trimLength(unescapeNewLines(args[1]), MAX_APPEND_TEXT_LENGTH);
				controller.onThemeComments(comments);
			}
			break;

		case GameMessages.Toggle:
			if (args.length > 3) {
				const themeIndex = parseInt(args[1], 10);
				const questionIndex = parseInt(args[2], 10);
				const price = parseInt(args[3], 10);

				controller.onToggle(themeIndex, questionIndex, price);
			}
			break;

		case GameMessages.Try:
			controller.onBeginPressButton();
			break;

		case GameMessages.Unbanned:
			if (args.length < 2) {
				break;
			}

			dispatch(roomActionCreators.unbanned(args[1]));

			dispatch(roomActionCreators.chatMessageAdded({
				sender: '',
				text: stringFormat(localization.userUnbanned, args[1]),
				level: MessageLevel.System,
			}));

			break;

		case 'WINNER':
			playGameSound(dispatch, state.settings.appSound, GameSound.APPLAUSE_FINAL);
			break;

		case 'WRONGTRY':
			{
				const index = parseInt(args[1], 10);
				const { players } = state.room.persons;

				if (index > -1 && index < players.length) {
					const player = players[index];

					if (player.state === PlayerStates.None) {
						dispatch(roomActionCreators.playerStateChanged(index, PlayerStates.Lost));
						setTimeout(
							() => {
								dispatch(roomActionCreators.playerLostStateDropped(index));
							},
							800
						);
					}
				}
			}
			break;

		default:
			break;
	}
};

function onCat(dispatch: Dispatch<any>, args: string[]) {
	const indices = getIndices(args);
	dispatch(roomActionCreators.selectionEnabled(indices, 'CAT'));
}

function onCatCost(dispatch: Dispatch<any>, args: string[]) {
	const allowedStakeTypes = {
		[StakeTypes.Nominal]: false,
		[StakeTypes.Sum]: true,
		[StakeTypes.Pass]: false,
		[StakeTypes.AllIn]: false
	};

	const minimum = parseInt(args[1], 10);
	const maximum = parseInt(args[2], 10);
	const step = parseInt(args[3], 10);

	dispatch(roomActionCreators.setStakes(allowedStakeTypes, minimum, maximum, minimum, step, 'CATCOST', true));
	dispatch(roomActionCreators.decisionNeededChanged(true));
}

function onStake2(dispatch: Dispatch<any>, _state: State, args: string[], maximum: number) {
	if (args.length < 4) {
		return;
	}

	const stakeTypes = parseStakeTypesFromString(args[1]);

	const allowedStakeTypes = {
		[StakeTypes.Nominal]: (stakeTypes & StakeTypes2.Nominal) > 0,
		[StakeTypes.Sum]: (stakeTypes & StakeTypes2.Stake) > 0,
		[StakeTypes.Pass]: (stakeTypes & StakeTypes2.Pass) > 0,
		[StakeTypes.AllIn]: (stakeTypes & StakeTypes2.AllIn) > 0,
	};

	const minimum = parseInt(args[2], 10);
	const step = parseInt(args[3], 10);

	dispatch(roomActionCreators.setStakes(allowedStakeTypes, minimum, maximum, minimum, step, 'STAKE', false));
	dispatch(roomActionCreators.decisionNeededChanged(true));
}

const playerHandler = (controller: ClientController, dispatch: Dispatch<any>, state: State, dataContext: DataContext, args: string[]) => {
	switch (args[0]) {
		case GameMessages.Answer:
			if (state.table.layoutMode === LayoutMode.Simple) {
				dispatch(roomActionCreators.isAnswering());
			} else {
				dispatch(roomActionCreators.decisionNeededChanged(true));
				dispatch(tableActionCreators.isSelectableChanged(true));
			}
			break;

		case 'CANCEL':
			dispatch(roomActionCreators.clearDecisions());
			break;

		case 'CAT':
			onCat(dispatch, args);
			break;

		case 'CATCOST':
			onCatCost(dispatch, args);
			break;

		case GameMessages.Choose:
			controller.onChoose();
			break;

		case 'FINALSTAKE':
			{
				const me = getMeAsPlayer(state);

				if (!me) {
					break;
				}

				const allowedStakeTypes = {
					[StakeTypes.Nominal]: false,
					[StakeTypes.Sum]: true,
					[StakeTypes.Pass]: false,
					[StakeTypes.AllIn]: false
				};

				dispatch(roomActionCreators.setStakes(allowedStakeTypes, 1, me.sum, 1, 1, 'FINALSTAKE', true));
				dispatch(roomActionCreators.decisionNeededChanged(true));
			}
			break;

		case 'REPORT':
			// TODO: process
			break;

		case GameMessages.Stake2:
			const me2 = getMeAsPlayer(state);

			if (!me2) {
				return;
			}

			const playerName = ''; // TODO: support in UI

			onStake2(dispatch, state, args, me2.sum);
			break;

		case GameMessages.Validation:
			startValidation(dispatch, localization.apellation, args);
			break;

		case GameMessages.Validation2:
			startValidation2(dispatch, localization.apellation, args);
			break;

		default:
			break;
	}
};

const showmanHandler = (controller: ClientController, dispatch: Dispatch<any>, state: State, dataContext: DataContext, args: string[]) => {
	switch (args[0]) {
		case 'CANCEL':
			dispatch(roomActionCreators.clearDecisions());
			break;

		case 'FIRST': {
			const indices = getIndices(args);
			dispatch(roomActionCreators.selectionEnabled(indices, 'FIRST'));
			dispatch(roomActionCreators.showmanReplicChanged(localization.selectFirstPlayer));
			break;
		}

		case 'FIRSTDELETE': {
			const indices = getIndices(args);
			dispatch(roomActionCreators.selectionEnabled(indices, 'NEXTDELETE'));
			dispatch(roomActionCreators.showmanReplicChanged(localization.selectThemeDeleter));
			break;
		}

		case 'FIRSTSTAKE': {
			const indices = getIndices(args);
			dispatch(roomActionCreators.selectionEnabled(indices, 'NEXT'));
			dispatch(roomActionCreators.showmanReplicChanged(localization.selectStaker));
			break;
		}

		case 'HINT':
			if (args.length > 1) {
				dispatch(roomActionCreators.hintChanged(args[1]));
			}
			break;

		case GameMessages.RightAnswer:
			dispatch(roomActionCreators.hintChanged(null));
			break;

		case 'STAGE':
			dispatch(roomActionCreators.decisionNeededChanged(false));
			dispatch(roomActionCreators.hintChanged(null));
			break;

		case GameMessages.Validation:
			startValidation(dispatch, localization.answerChecking, args);
			break;

		case GameMessages.Validation2:
			startValidation2(dispatch, localization.answerChecking, args);
			break;

		// Player commands for oral game
		case 'CAT':
			onCat(dispatch, args);
			break;

		case 'CATCOST':
			onCatCost(dispatch, args);
			break;

		case GameMessages.Choose:
			controller.onChoose();
			break;

		case GameMessages.Stake2:
			if (args.length < 6) {
				break;
			}

			const maximum2 = args[4];
			const playerName = args[5]; // TODO: support in UI

			onStake2(dispatch, state, args, parseInt(maximum2, 10));
			break;

		default:
			break;
	}
};

function startValidation(dispatch: Dispatch<RoomActions.KnownRoomAction>, title: string, args: string[]) {
	if (args.length < 5) {
		return;
	}

	const name = args[1];
	const answer = args[2];
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isVoteForTheRightAnswer = args[3] === '+'; // Not used
	const rightAnswersCount = Math.min(parseInt(args[4], 10), args.length - 5);

	const right = [];
	for (let i = 0; i < rightAnswersCount; i++) {
		right.push(args[5 + i]);
	}

	const wrong = [];
	for (let i = 5 + rightAnswersCount; i < args.length; i++) {
		wrong.push(args[i]);
	}

	const validationMesssage = `${localization.playersAnswer} ${name} "${answer}". ${localization.validateAnswer}`;
	dispatch(roomActionCreators.validate(name, answer, right, wrong, title, validationMesssage, false));
}

function startValidation2(dispatch: Dispatch<RoomActions.KnownRoomAction>, title: string, args: string[]) {
	if (args.length < 6) {
		return;
	}

	const name = args[1];
	const answer = args[2];
	const showExtraRightButtons = args[4] == '+';
	const rightAnswersCount = Math.min(parseInt(args[5], 10), args.length - 5);

	const right = [];

	for (let i = 0; i < rightAnswersCount; i++) {
		right.push(args[6 + i]);
	}

	const wrong = [];

	for (let i = 6 + rightAnswersCount; i < args.length; i++) {
		wrong.push(args[i]);
	}

	const validationMesssage = `${localization.playersAnswer} ${name} "${answer}". ${localization.validateAnswer}`;
	dispatch(roomActionCreators.validate(name, answer, right, wrong, title, validationMesssage, showExtraRightButtons));
}

function getIndices(args: string[]): number[] {
	const indices: number[] = [];
	for (let i = 0; i + 1 < args.length; i++) {
		if (args[i + 1] === '+') {
			indices.push(i);
		}
	}

	return indices;
}

function info(dispatch: Dispatch<RoomActions.KnownRoomAction>, ...args: string[]) {
	const playersCount = parseInt(args[1], 10);
	const viewersCount = (args.length - 2) / 5 - 1 - playersCount;
	let pIndex = 2;

	let name = args[pIndex++];
	let isMale = args[pIndex++] === '+';
	let isConnected = args[pIndex++] === '+';
	let isHuman = args[pIndex++] === '+';
	let isReady = args[pIndex++] === '+';

	const all: Persons = {};

	const showman: PersonInfo = {
		name,
		isReady,
		replic: null,
		isDeciding: false,
		isHuman
	};

	if (isConnected) {
		all[name] = {
			name,
			sex: isMale ? Sex.Male : Sex.Female,
			isHuman,
			avatar: null
		};
	}

	const players: PlayerInfo[] = [];

	for (let i = 0; i < playersCount; i++) {
		name = args[pIndex++];
		isMale = args[pIndex++] === '+';
		isConnected = args[pIndex++] === '+';
		isHuman = args[pIndex++] === '+';
		isReady = args[pIndex++] === '+';

		players.push({
			name,
			isReady,
			sum: 0,
			stake: 0,
			state: PlayerStates.None,
			canBeSelected: false,
			replic: null,
			isDeciding: false,
			isHuman,
			isChooser: false,
			inGame: true,
			mediaLoaded: false,
		});

		if (isConnected) {
			all[name] = {
				name,
				sex: isMale ? Sex.Male : Sex.Female,
				isHuman,
				avatar: null
			};
		}
	}

	for (let i = 0; i < viewersCount; i++) {
		name = args[pIndex++];
		isMale = args[pIndex++] === '+';
		isConnected = args[pIndex++] === '+'; // is not used
		isHuman = args[pIndex++] === '+';
		isReady = args[pIndex++] === '+'; // is not used

		all[name] = {
			name,
			sex: isMale ? Sex.Male : Sex.Female,
			isHuman,
			avatar: null
		};
	}

	dispatch(roomActionCreators.infoChanged(all, showman, players));
	dispatch(actionCreators.sendAvatar() as any);
}

function disconnected(dispatch: Dispatch<RoomActions.KnownRoomAction>, state: State, ...args: string[]) {
	const name = args[1];

	dispatch(roomActionCreators.personRemoved(name));

	if (state.room.persons.showman.name === name) {
		dispatch(roomActionCreators.showmanChanged(Constants.ANY_NAME, null, false));
	} else {
		for (let i = 0; i < state.room.persons.players.length; i++) {
			if (state.room.persons.players[i].name === name) {
				dispatch(roomActionCreators.playerChanged(i, Constants.ANY_NAME, null, false));
				break;
			}
		}
	}
}

function playGameSound(dispatch: Dispatch<any>, isSoundEnabled: boolean, sound: GameSound, loop = false): void {
	if (!isSoundEnabled) {
		return;
	}

	dispatch(commonActionCreators.playAudio(sound, loop));
}
