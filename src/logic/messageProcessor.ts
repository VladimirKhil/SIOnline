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
import PlayerStates, { parsePlayerStatesFromString } from '../model/enums/PlayerStates';
import ThemeInfo from '../model/ThemeInfo';
import PersonInfo from '../model/PersonInfo';
import Persons from '../model/Persons';
import PlayerInfo from '../model/PlayerInfo';
import Constants from '../model/enums/Constants';
import Role from '../model/Role';
import localization from '../model/resources/localization';
import stringFormat, { trimLength } from '../utils/StringHelpers';
import MessageLevel from '../model/enums/MessageLevel';
import GameMessages from '../client/game/GameMessages';
import JoinMode from '../client/game/JoinMode';
import { parseStakeModesFromString } from '../client/game/StakeModes';
import LayoutMode from '../model/enums/LayoutMode';
import ClientController from './ClientController';
import ContentInfo from '../model/ContentInfo';
import ItemState from '../model/enums/ItemState';
import GameSound from '../model/enums/GameSound';
import { playAudio } from '../state/commonSlice';
import clearUrls from '../utils/clearUrls';
import ThemesPlayMode from '../model/enums/ThemesPlayMode';
import { AppDispatch } from '../state/store';
import { captionChanged } from '../state/tableSlice';
import { playerInGameChanged,
	playerMediaLoaded,
	playerStakeChanged,
	playerStateChanged } from '../state/room2Slice';
import StakeTypes from '../model/enums/StakeTypes';

const MAX_APPEND_TEXT_LENGTH = 150;

function unescapeNewLines(value: string): string {
	return value.replaceAll('\\n', '\n').replaceAll('\\\\', '\\');
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

function onValidation(controller: ClientController, title: string, args: string[]) {
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

	controller.onValidation(title, name, answer, '', right, wrong, showExtraRightButtons);
}

function onQuestionAnswers(controller: ClientController, args: string[]) {
	if (args.length < 3) {
		return;
	}

	const rightAnswerCount = Math.min(parseInt(args[1], 10), args.length - 2);
	const right = [];

	for (let i = 0; i < rightAnswerCount; i++) {
		right.push(args[2 + i]);
	}

	const wrong = [];

	for (let i = 2 + rightAnswerCount; i < args.length; i++) {
		wrong.push(args[i]);
	}

	controller.onQuestionAnswers(right, wrong);
}

const viewerHandler = (
	controller: ClientController,
	dispatch: Dispatch<any>,
	appDispatch: AppDispatch,
	state: State,
	dataContext: DataContext,
	args: string[]) => {
	switch (args[0]) {
		case GameMessages.Ads:
			if (args.length === 1) {
				break;
			}

			let ads = args[1];

			if (dataContext.config.clearUrls) {
				ads = clearUrls(ads);
			}

			controller.onAds(ads);
			break;

		case GameMessages.Answers:
			if (args.length === 1) {
				break;
			}

			controller.onAnswers(args.slice(1));
			break;

		case GameMessages.ApellationEnabled:
			if (args.length === 1) {
				break;
			}

			controller.onApellationEnabled(args[1] === '+');
			break;

		case GameMessages.AtomHint:
			if (args.length < 2) {
				break;
			}

			controller.onContentHint(args[1]);
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

			controller.onBanned(args[1], args[2]);
			break;

		case GameMessages.BannedList:
			const bannedList: Record<string, string> = {};

			for (let i = 1; i < args.length - 1; i += 2) {
				bannedList[args[i]] = args[i + 1];
			}

			controller.onBannedList(bannedList);
			break;

		case GameMessages.ButtonBlockingTime:
			if (args.length === 1) {
				break;
			}

			controller.onButtonBlockingTimeChanged(parseInt(args[1], 10));
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

		case GameMessages.ContentShape: {
			if (args.length < 5) {
				return;
			}

			const placement = args[1];
			const layoutId = args[2];
			const contentType = args[3];

			if (placement !== 'screen' || layoutId !== '0' || contentType !== 'text') {
				return;
			}

			const text = unescapeNewLines(args[4]);
			controller.onContentShape(text);
			break;
		}

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

		case GameMessages.Disconnected:
			if (args.length < 2) {
				return;
			}

			controller.onDisconnected(args[1]);
			break;

		case GameMessages.EndTry: {
			if (args.length < 2) {
				return;
			}

			const index = (Number)(args[1]);

			if (!isNaN(index) && index > -1 && index < state.room2.persons.players.length) {
				controller.onEndPressButtonByPlayer(index);
			} else if (args[1] === 'A') { // This is ENDTRY for All
				controller.onEndPressButtonByTimeout();
			}
			break;
		}

		case GameMessages.FinalRound:
			const playersLength = state.room2.persons.players.length;

			for (let i = 1; i < Math.min(args.length, playersLength + 1); i++) {
				appDispatch(playerInGameChanged({ playerIndex: i - 1, inGame: args[i] === '+' }));
			}

			dispatch(roomActionCreators.afterQuestionStateChanged(false));
			break;

		case GameMessages.FinalThink:
			controller.onFinalThink();
			break;

		case GameMessages.GameClosed:
			controller.onGameClosed();
			break;

		case GameMessages.GameMetadata:
			if (args.length < 4) {
				break;
			}

			dispatch(roomActionCreators.gameMetadataChanged(args[1], args[2], args[3], args.length > 4 ? args[4] : null));
			break;

		case GameMessages.GameThemes:
			controller.onGameThemes(args.slice(1));
			break;

		case GameMessages.HostName:
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

		case GameMessages.Info:
			info(controller, ...args);
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

			const { players } = state.room2.persons;

			for (let i = 0; i < players.length; i++) {
				if (players[i].name === args[1]) {
					appDispatch(playerMediaLoaded(i));
					break;
				}
			}

			break;

		case GameMessages.Options:
			for (let i = 1; i + 1 < args.length; i += 2) {
				const argName = args[i];
				const value = args[i + 1];

				controller.onOptionChanged(argName, value);
			}

			break;

		case GameMessages.Out:
			if (args.length > 1) {
				const themeIndex = parseInt(args[1], 10);
				controller.onThemeDeleted(themeIndex);
			}
			break;

		case GameMessages.Pass:
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.room2.persons.players.length) {
					controller.onPass(playerIndex);
				}
			}
			break;

		case GameMessages.Package:
			if (args.length < 2) {
				break;
			}

			const packageName = args[1];
			const packageLogo = args.length > 3 ? args[3] : null;
			controller.onPackage(packageName, packageLogo);
			break;

		case GameMessages.Pause:
			const isPaused = args[1] === '+';
			controller.onPause(isPaused, args.slice(2).map(v => parseInt(v, 10)));
			break;

		case GameMessages.Person:
			{
				const isRight = args[1] === '+';
				const index = parseInt(args[2], 10);

				controller.onPerson(index, isRight);
			}
			break;

		case 'PERSONAPELLATED':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.room2.persons.players.length) {
					appDispatch(playerStateChanged({ index: playerIndex, state: PlayerStates.HasAnswered }));
				}
			}
			break;

		case 'PERSONFINALANSWER':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.room2.persons.players.length) {
					appDispatch(playerStateChanged({ index: playerIndex, state: PlayerStates.HasAnswered }));
				}
			}
			break;

		case 'PERSONFINALSTAKE':
			{
				const playerIndex = parseInt(args[1], 10);
				const player = state.room2.persons.players[playerIndex];

				if (!player) {
					break;
				}

				appDispatch(playerStakeChanged({ index: playerIndex, stake: Constants.HIDDEN_STAKE }));
			}
			break;

		case 'PERSONSTAKE':
			{
				const playerIndex = parseInt(args[1], 10);
				const player = state.room2.persons.players[playerIndex];

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

				appDispatch(playerStakeChanged({ index: playerIndex, stake }));
			}
			break;

		case 'PICTURE': {
			const personName = args[1];
			const uri = controller.preprocessServerUri(args[2]);

			dispatch(roomActionCreators.personAvatarChanged(personName, uri));
			break;
		}

		case GameMessages.Pin:
			if (args.length > 1) {
				const pin = args[1];
				controller.onPin(pin);
			}
			break;

		case GameMessages.PlayerState:
			if (args.length > 1) {
				controller.onPlayerState(parsePlayerStatesFromString(args[1]), args.slice(2).map(i => parseInt(i, 10)));
			}
			break;

		case GameMessages.QType: // = Question start
			if (args.length > 2) {
				controller.onQuestionType(args[1], args[2] === 'True');
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

		case GameMessages.ReadingSpeed:
			if (args.length < 2) {
				break;
			}

			controller.onReadingSpeedChanged(parseInt(args[1], 10));
			break;

		case GameMessages.Ready:
			if (args.length < 2) {
				break;
			}

			controller.onReady(args[1], args.length < 3 || args[2] === '+');
			break;

		case GameMessages.Replic: {
			if (args.length < 3) {
				break;
			}

			const personCode = args[1];
			let text = '';

			for (let i = 2; i < args.length; i++) {
				if (text.length > 0) {
					text += '\n';
				}

				text += args[i];
			}

			if (dataContext.config.clearUrls) {
				text = clearUrls(text);
			}

			controller.onReplic(personCode, text);
			break;
		}

		case GameMessages.Resume:
			controller.onResumeMedia();
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
				appDispatch(captionChanged(localization.rightAnswer));
			}
			break;

		case GameMessages.RoundContent:
			controller.onRoundContent(args.slice(1));
			break;

		case GameMessages.RoundsNames:
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

		case GameMessages.SetChooser:
			const chooserIndex = parseInt(args[1], 10);
			controller.onSetChooser(chooserIndex, args.length > 2);
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
			const rules = args.length > 4 ? args[4] : '';
			controller.onStage(stage, stageName, stageIndex, rules);
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

		case GameMessages.Sums:
			const max = Math.min(args.length - 1, Object.keys(state.room2.persons.players).length);
			const sums: number[] = [];

			for (let i = 0; i < max; i++) {
				sums.push(parseInt(args[i + 1], 10));
			}

			controller.onSums(sums);
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

		case GameMessages.Timeout:
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
				roomActionCreators.showLeftSeconds(leftSeconds, appDispatch);
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

		case GameMessages.UserError:
			if (args.length > 1) {
				controller.onUserError(parseInt(args[1], 10), args.slice(2));
			}
			break;

		case GameMessages.Winner:
			playGameSound(dispatch, state.settings.appSound, GameSound.APPLAUSE_FINAL);
			break;

		case GameMessages.WrongTry:
			{
				if (args.length < 2) {
					break;
				}

				const playerIndex = parseInt(args[1], 10);
				controller.onWrongTry(playerIndex);
			}
			break;

		default:
			break;
	}
};

function onAskStake(controller: ClientController, args: string[]) {
	if (args.length < 6) {
		return;
	}

	const stakeModes = parseStakeModesFromString(args[1]);
	const minimum = parseInt(args[2], 10);
	const maximum = parseInt(args[3], 10);
	const step = parseInt(args[4], 10);
	const reason = args[5];

	const playerName = args.length > 6 ? args[6] : null;

	controller.onAskStake(stakeModes, minimum, maximum, step, reason, playerName);
}

const playerHandler = (controller: ClientController, args: string[]) => {
	switch (args[0]) {
		case GameMessages.Answer:
			controller.onAskAnswer();
			break;

		case GameMessages.AskSelectPlayer:
			if (args.length < 3) {
				return;
			}

			const indices = getIndices(args);
			controller.onAskSelectPlayer(args[1], indices);
			break;

		case GameMessages.AskStake:
			onAskStake(controller, args);
			break;

		case GameMessages.Cancel:
			controller.onCancel();
			break;

		case GameMessages.OralAnswer:
			controller.onOralAnswer();
			break;

		case GameMessages.Choose:
			controller.onChoose();
			break;

		case GameMessages.Report:
			if (args.length < 2) {
				return;
			}

			const report = args[1].replaceAll('\r', '\n');
			controller.onReport(report);
			break;

		case GameMessages.Validation2:
			onValidation(controller, localization.apellation, args);
			break;

		default:
			break;
	}
};

const showmanHandler = (controller: ClientController, dispatch: Dispatch<any>, args: string[]) => {
	switch (args[0]) {
		case GameMessages.AskSelectPlayer:
			if (args.length < 3) {
				return;
			}

			const indices = getIndices(args);
			controller.onAskSelectPlayer(args[1], indices);
			break;

		case GameMessages.AskValidate:
			if (args.length < 3) {
				return;
			}

			controller.onAskValidate(parseInt(args[1], 10), args[2]);
			break;

		case GameMessages.Cancel:
			controller.onCancel();
			break;

		case GameMessages.Hint:
			if (args.length > 1) {
				dispatch(roomActionCreators.hintChanged(args[1]));
			}
			break;

		case GameMessages.QuestionAnswers:
			onQuestionAnswers(controller, args);
			break;

		case GameMessages.RightAnswer:
			dispatch(roomActionCreators.hintChanged(null));
			break;

		case GameMessages.Stage:
			dispatch(roomActionCreators.decisionNeededChanged(false));
			dispatch(roomActionCreators.hintChanged(null));
			break;

		case GameMessages.Validation2:
			onValidation(controller, localization.answerChecking, args);
			break;

		// Player commands for oral game
		case GameMessages.Answer:
			controller.onAskAnswer();
			break;

		case GameMessages.AskStake:
			onAskStake(controller, args);
			break;

		case GameMessages.Choose:
			controller.onChoose();
			break;

		default:
			break;
	}
};

function getIndices(args: string[]): number[] {
	const indices: number[] = [];

	for (let i = 0; i + 2 < args.length; i++) {
		if (args[i + 2] === '+') {
			indices.push(i);
		}
	}

	return indices;
}

function info(controller: ClientController, ...args: string[]) {
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
			answer: '',
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

	controller.onInfo(all, showman, players);
}

function playGameSound(appDispatch: Dispatch<any>, isSoundEnabled: boolean, sound: GameSound, loop = false): void {
	if (!isSoundEnabled) {
		return;
	}

	appDispatch(playAudio({ audio: sound, loop }));
}

const processSystemMessage: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (
	controller: ClientController,
	message: Message,
	appDispatch: AppDispatch
) => (dispatch: Dispatch<RoomActions.KnownRoomAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const { role } = state.room;
		const args = message.Text.split('\n');

		viewerHandler(controller, dispatch, appDispatch, state, dataContext, args);

		if (role === Role.Player) {
			playerHandler(controller, args);
		} else if (role === Role.Showman) {
			showmanHandler(controller, dispatch, args);
		}
	};

const userMessageReceived: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (message: Message) => (
	dispatch: Dispatch<any>,
	getState: () => State) => {
		if (message.Sender === getState().room2.name) {
			return;
		}

		const replic: ChatMessage = {
			sender: message.Sender,
			text: message.Text,
			level: MessageLevel.Information,
		};

		dispatch(roomActionCreators.chatMessageAdded(replic));
	};

export default function messageProcessor(controller: ClientController, dispatch: Dispatch<AnyAction>, appDispatch: AppDispatch, message: Message) {
	if (message.IsSystem) {
		dispatch((processSystemMessage(controller, message, appDispatch) as object) as AnyAction);
		return;
	}

	dispatch((userMessageReceived(message) as object) as AnyAction);
}
