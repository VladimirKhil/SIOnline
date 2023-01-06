import { Dispatch, AnyAction, ActionCreator, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import Message from '../../model/Message';
import State from '../State';
import DataContext from '../../model/DataContext';
import * as RunActions from '../run/RunActions';
import ChatMessage from '../../model/ChatMessage';
import runActionCreators from '../run/runActionCreators';
import Account from '../../model/Account';
import Sex from '../../model/enums/Sex';
import PlayerStates from '../../model/enums/PlayerStates';
import tableActionCreators from '../table/tableActionCreators';
import ThemeInfo from '../../model/ThemeInfo';
import PersonInfo from '../../model/PersonInfo';
import Persons from '../../model/Persons';
import PlayerInfo from '../../model/PlayerInfo';
import Constants from '../../model/enums/Constants';
import Role from '../../client/contracts/Role';
import localization from '../../model/resources/localization';
import StakeTypes from '../../model/enums/StakeTypes';
import stringFormat from '../../utils/StringHelpers';
import actionCreators from '../actionCreators';
import MessageLevel from '../../model/enums/MessageLevel';

let lastReplicLock: number;

export default function messageProcessor(dispatch: Dispatch<AnyAction>, message: Message) {
	if (message.isSystem) {
		dispatch((processSystemMessage(dispatch, message) as object) as AnyAction);
		return;
	}

	dispatch((userMessageReceived(message) as object) as AnyAction);
}

const processSystemMessage: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (dispatch: Dispatch<AnyAction>, message: Message) =>
	(dispatch: Dispatch<RunActions.KnownRunAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const { role } = state.run;
		const args = message.text.split('\n');

		viewerHandler(dispatch, state, dataContext, args);

		if (role === Role.Player) {
			playerHandler(dispatch, state, dataContext, args);
		} else if (role === Role.Showman) {
			showmanHandler(dispatch, state, dataContext, args);
		}
	};

const userMessageReceived: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (message: Message) =>
	(dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		if (message.sender === getState().user.login) {
			return;
		}

		const replic: ChatMessage = {
			sender: message.sender,
			text: message.text,
			level: MessageLevel.Information,
		};

		dispatch(runActionCreators.chatMessageAdded(replic));

		if (!getState().run.chat.isVisible && getState().ui.windowWidth < 800) {
			dispatch(runActionCreators.lastReplicChanged(replic));

			if (lastReplicLock) {
				window.clearTimeout(lastReplicLock);
			}

			lastReplicLock = window.setTimeout(
				() => {
					dispatch(runActionCreators.lastReplicChanged(null));
				},
				3000
			);
		}
	};

function onReady(personName: string, isReady: boolean, dispatch: Dispatch<any>, state: State): void {
	let personIndex: number;
	if (personName === state.run.persons.showman.name) {
		personIndex = -1;
	} else {
		personIndex = state.run.persons.players.findIndex(p => p.name === personName);
		if (personIndex === -1) {
			return;
		}
	}

	dispatch(runActionCreators.isReadyChanged(personIndex, isReady));
}

function preprocessServerUri(uri: string, dataContext: DataContext) {
	const result = uri.replace(
		'<SERVERHOST>',
		dataContext.contentUris && dataContext.contentUris.length > 0
			? dataContext.contentUris[0]
			: dataContext.serverUri
	);

	if (location.protocol === 'https:') {
		return result.replace('http://', 'https://');
	}

	return result;
}

const viewerHandler = (dispatch: Dispatch<any>, state: State, dataContext: DataContext, args: string[]) => {
	switch (args[0]) {
		case 'ADS':
			if (args.length === 1) {
				break;
			}

			const adsMessage = args[1];
			// TODO: show ad on screen
			break;

		case 'APELLATION_ENABLES':
			if (args.length === 1) {
				break;
			}

			dispatch(runActionCreators.areApellationsEnabledChanged(args[1] === '+'));
			break;

		case 'ATOM':
			switch (args[1]) {
				case 'text':
				case 'partial':
					{
						let text = '';
						for (let i = 2; i < args.length; i++) {
							if (text.length > 0) {
								text += '\n';
							}

							text += args[i];
						}

						if (args[1] === 'text') {
							dispatch(tableActionCreators.showText(text, true));
						} else {
							dispatch(tableActionCreators.appendPartialText(text));
						}
					}
					break;

				case 'image':
					{
						const uri = preprocessServerUri(args[3], dataContext);
						dispatch(tableActionCreators.showImage(uri));
					}
					break;

				case 'voice':
					{
						const uri = preprocessServerUri(args[3], dataContext);
						dispatch(tableActionCreators.showAudio(uri));
					}
					break;

				case 'video':
					{
						const uri = preprocessServerUri(args[3], dataContext);
						dispatch(tableActionCreators.showVideo(uri));
					}
					break;

				case 'html':
					{
						const uri = preprocessServerUri(args[3], dataContext);
						dispatch(tableActionCreators.showHtml(uri));
					}
					break;

				default:
					break;
			}
			break;

		case 'ATOM_SECOND':
			switch (args[1]) {
				case 'voice': // only audio is supported as a second atom
					{
						const uri = preprocessServerUri(args[3], dataContext);
						dispatch(tableActionCreators.showBackgroundAudio(uri));
					}
					break;

				default:
					break;
			}
			break;

		case 'BUTTON_BLOCKING_TIME':
			if (args.length === 1) {
				break;
			}

			dispatch(runActionCreators.buttonBlockingTimeChanged(parseInt(args[1], 10)));
			break;

		case 'CHOICE':
			{
				const themeIndex = parseInt(args[1], 10);
				const questIndex = parseInt(args[2], 10);

				dispatch(runActionCreators.playersStateCleared());
				dispatch(runActionCreators.afterQuestionStateChanged(false));

				const themeInfo = state.run.table.roundInfo[themeIndex];
				if (themeInfo) {
					const quest = themeInfo.questions[questIndex];
					if (quest) {
						dispatch(runActionCreators.currentPriceChanged(quest));
						dispatch(tableActionCreators.captionChanged(`${themeInfo.name}, ${quest}`));
						dispatch(tableActionCreators.blinkQuestion(themeIndex, questIndex));

						setTimeout(
							() => {
								dispatch(tableActionCreators.removeQuestion(themeIndex, questIndex));
							},
							5000
						);
					}
				}
			}
			break;

		case 'CONFIG':
			config(dispatch, state, ...args);
			break;

		case 'CONNECTED':
			connected(dispatch, state, ...args);
			break;

		case 'DISCONNECTED':
			disconnected(dispatch, state, ...args);
			break;

		case 'ENDTRY':
			{
				dispatch(tableActionCreators.canPressChanged(false));

				const index = (Number)(args[1]);
				if (!isNaN(index) && index > -1 && index < state.run.persons.players.length) {
					dispatch(runActionCreators.playerStateChanged(index, PlayerStates.Press));
				} else if (args[1] === 'A') {
					dispatch(runActionCreators.stopTimer(1));
				}
			}
			break;

		case 'FALSESTART':
			// Not used - game button is always available
			break;

		case 'FINALROUND':
			const playersLength = state.run.persons.players.length;
			for (let i = 1; i < Math.min(args.length, playersLength + 1); i++) {
				dispatch(runActionCreators.playerInGameChanged(i - 1, args[i] === '+'));
			}
			break;

		case 'FINALTHINK':
			// Not used - finalthink sound could be played here
			break;

		case 'GAMETHEMES':
			{
				const gameThemes = [];
				for (let i = 1; i < args.length; i++) {
					gameThemes.push(args[i]);
				}

				dispatch(tableActionCreators.showGameThemes(gameThemes));
			}
			break;

		case 'HOSTNAME':
			if (args.length > 1) {
				dispatch(runActionCreators.hostNameChanged(args[1]));
				if (args.length > 2) {
					const changeSource = args[2].length > 0 ? args[2] : localization.byGame;

					dispatch(runActionCreators.chatMessageAdded({
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

		case 'OUT':
			{
				const themeIndex = parseInt(args[1], 10);

				const themeInfo = state.run.table.roundInfo[themeIndex];
				if (themeInfo) {
					dispatch(tableActionCreators.blinkTheme(themeIndex));

					setTimeout(
						() => {
							dispatch(tableActionCreators.removeTheme(themeIndex));
						},
						600
					);
				}
			}
			break;

		case 'PACKAGELOGO':
			const uri = preprocessServerUri(args[1], dataContext);
			dispatch(tableActionCreators.showImage(uri));
			break;

		case 'PASS':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.run.persons.players.length) {
					dispatch(runActionCreators.playerStateChanged(playerIndex, PlayerStates.Pass));
				}
			}
			break;

		case 'PAUSE':
			const isPaused = args[1] === '+';
			dispatch(runActionCreators.isPausedChanged(isPaused));

			if (args.length > 4) {
				if (isPaused) {
					dispatch(runActionCreators.pauseTimer(0, args[2], true));
					dispatch(runActionCreators.pauseTimer(1, args[3], true));
					dispatch(runActionCreators.pauseTimer(2, args[4], true));
				} else {
					dispatch(runActionCreators.resumeTimer(0, true));
					dispatch(runActionCreators.resumeTimer(1, true));
					dispatch(runActionCreators.resumeTimer(2, true));
				}
			}
			break;

		case 'PERSON':
			{
				const isRight = args[1] === '+';
				const index = parseInt(args[2], 10);

				if (index > -1 && index < state.run.persons.players.length) {
					dispatch(runActionCreators.playerStateChanged(index, isRight ? PlayerStates.Right : PlayerStates.Wrong));
				}
			}
			break;

		case 'PERSONAPELLATED':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.run.persons.players.length) {
					dispatch(runActionCreators.playerStateChanged(playerIndex, PlayerStates.HasAnswered));
				}
			}
			break;

		case 'PERSONFINALANSWER':
			{
				const playerIndex = parseInt(args[1], 10);

				if (playerIndex > -1 && playerIndex < state.run.persons.players.length) {
					dispatch(runActionCreators.playerStateChanged(playerIndex, PlayerStates.HasAnswered));
				}
			}
			break;

		case 'PERSONFINALSTAKE':
			{
				const playerIndex = parseInt(args[1], 10);
				const player = state.run.persons.players[playerIndex];
				if (!player) {
					break;
				}

				dispatch(runActionCreators.playerStakeChanged(playerIndex, Constants.HIDDEN_STAKE));
			}
			break;

		case 'PERSONSTAKE':
			{
				const playerIndex = parseInt(args[1], 10);
				const player = state.run.persons.players[playerIndex];
				if (!player) {
					break;
				}

				const stakeType = parseInt(args[2], 10) as StakeTypes;
				let stake = 0;
				switch (stakeType) {
					case StakeTypes.Nominal:
						stake = state.run.stage.currentPrice;
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

				dispatch(runActionCreators.playerStakeChanged(playerIndex, stake));
			}
			break;

		case 'PICTURE': {
			const personName = args[1];
			const uri = preprocessServerUri(args[2], dataContext);

			dispatch(runActionCreators.personAvatarChanged(personName, uri));

			break;
		}

		case 'QTYPE':
			const qType = args[1];
			switch (qType) {
				case 'auction':
					dispatch(tableActionCreators.showSpecial(localization.questionTypeStake, state.run.table.activeThemeIndex));
					break;

				case 'cat':
				case 'bagcat':
					dispatch(tableActionCreators.showSpecial(localization.questionTypeSecret));
					break;

				case 'sponsored':
					dispatch(tableActionCreators.showSpecial(localization.questionTypeNoRisk));
					break;

				default:
					break;
			}

			break;

		case 'QUESTION':
			if (args.length > 1) {
				dispatch(runActionCreators.playersStateCleared());
				dispatch(tableActionCreators.showText(args[1], false));
				dispatch(runActionCreators.afterQuestionStateChanged(false));
				dispatch(runActionCreators.updateCaption(args[1]));
			}
			break;

		case 'QUESTIONCAPTION':
			if (args.length > 1) {
				dispatch(tableActionCreators.captionChanged(args[1]));
			}
			break;

		case 'READINGSPEED':
			if (args.length < 2) {
				break;
			}

			dispatch(runActionCreators.readingSpeedChanged(parseInt(args[1], 10)));
			break;

		case 'READY':
			if (args.length < 2) {
				break;
			}

			onReady(args[1], args.length < 3 || args[2] === '+', dispatch, state);
			break;

		case 'REPLIC':
			if (args.length < 3) {
				break;
			}

			onReplic(dispatch, state, args);
			break;

		case 'RESUME':
			dispatch(tableActionCreators.resumeMedia());
			break;

		case 'RIGHTANSWER':
			dispatch(tableActionCreators.showAnswer(args[2]));
			dispatch(runActionCreators.afterQuestionStateChanged(true));
			dispatch(tableActionCreators.captionChanged(''));
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
				const contentUri = preprocessServerUri(url, dataContext);

				// Straight but working method
				// TODO: await
				fetch(contentUri)
					.then(response => {
						if (!response.ok) {
							dispatch(runActionCreators.chatMessageAdded({
								sender: '',
								text: response.statusText,
								level: MessageLevel.System,
							}));
						}
					})
					.catch((e : TypeError) => {
						dispatch(runActionCreators.chatMessageAdded({
							sender: '',
							text: e.message,
							level: MessageLevel.System,
						}));
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
			dispatch(runActionCreators.roundsNamesChanged(args.slice(1)));
			break;

		case 'ROUNDTHEMES':
			const printThemes = args[1] === '+';

			const roundThemes: ThemeInfo[] = [];
			for (let i = 2; i < args.length; i++) {
				roundThemes.push({ name: args[i], questions: [] });
			}

			dispatch(tableActionCreators.showRoundThemes(roundThemes, state.run.stage.name === 'Final', printThemes));
			break;

		case 'SETCHOOSER':
			const chooserIndex = parseInt(args[1], 10);
			dispatch(runActionCreators.chooserChanged(chooserIndex));
			if (args.length > 2) {
				dispatch(runActionCreators.playerStateChanged(chooserIndex, PlayerStates.Press));
			}
			break;

		case 'SHOWTABLO':
			dispatch(tableActionCreators.showRoundTable());
			break;

		case 'STAGE':
			const stage = args[1];
			const roundIndex = args.length > 3 ? parseInt(args[3], 10) : -1;
			dispatch(runActionCreators.stageChanged(stage, roundIndex));

			if (stage !== 'Before') {
				dispatch(runActionCreators.gameStarted());
			}

			if (stage === 'Round' || stage === 'Final') {
				dispatch(tableActionCreators.showRound(args[2]));
				dispatch(runActionCreators.playersStateCleared());
				if (stage === 'Round') {
					for	(let i = 0; i < state.run.persons.players.length; i++) {
						dispatch(runActionCreators.playerInGameChanged(i, true));
					}
				}
			} else if (stage === 'After') {
				dispatch(tableActionCreators.showLogo());
			}

			dispatch(runActionCreators.gameStateCleared());
			break;

		case 'STOP':
			dispatch(runActionCreators.stopTimer(0));
			dispatch(runActionCreators.stopTimer(1));
			dispatch(runActionCreators.stopTimer(2));

			dispatch(tableActionCreators.showLogo());
			break;

		case 'SUMS':
			const max = Math.min(args.length - 1, Object.keys(state.run.persons.players).length);
			const sums: number[] = [];
			for (let i = 0; i < max; i++) {
				sums.push(parseInt(args[i + 1], 10));
			}

			dispatch(runActionCreators.sumsChanged(sums));

			break;

		case 'TABLO2':
			const { roundInfo } = state.run.table;
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
				while (index < args.length && args[index].length > 0) { // пустой параметр разделяет темы
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

			dispatch(tableActionCreators.showRoundThemes(newRoundInfo, state.run.stage.name === 'Final', false));
			break;

		case 'TEXTSHAPE':
			let text = '';
			for (let i = 1; i < args.length; i++) {
				if (text.length > 0) {
					text += '\n';
				}

				text += args[i];
			}

			dispatch(tableActionCreators.showPartialText(text));
			break;

		case 'TIMEOUT':
			// Not used - timeout sound could be played here
			break;

		case 'TIMER':
			// Special case for automatic game
			if (!state.run.stage.isGameStarted && state.game.isAutomatic && args.length === 5
				&& args[1] === '2' && args[2] === 'GO' && args[4] === '-2') {
				const leftSeconds = parseInt(args[3], 10) / 10;

				runActionCreators.showLeftSeconds(leftSeconds, dispatch);
			} else if (args.length > 2) {
				const timerIndex = parseInt(args[1], 10);
				const timerCommand = args[2];
				const timerArgument = args.length > 3 ? parseInt(args[3], 10) : 0;
				const timerPersonIndex = args.length > 4 ? parseInt(args[4], 10) : null;

				switch (timerCommand) {
					case 'GO':
						dispatch(runActionCreators.runTimer(timerIndex, timerArgument, false));

						if (timerIndex === 2 && timerPersonIndex !== null) {
							if (timerPersonIndex === -1) {
								dispatch(runActionCreators.activateShowmanDecision());
							} else if (timerPersonIndex === -2) {
								dispatch(runActionCreators.showMainTimer());
							} else if (timerPersonIndex > -1 && timerPersonIndex < state.run.persons.players.length) {
								dispatch(runActionCreators.activatePlayerDecision(timerPersonIndex));
							}
						}
						break;

					case 'STOP':
						dispatch(runActionCreators.stopTimer(timerIndex));

						if (timerIndex === 2) {
							dispatch(runActionCreators.clearDecisionsAndMainTimer());
						}
						break;

					case 'PAUSE':
						dispatch(runActionCreators.pauseTimer(timerIndex, timerArgument, false));
						break;

					case 'USER_PAUSE':
						dispatch(runActionCreators.pauseTimer(timerIndex, timerArgument, true));
						break;

					case 'RESUME':
						dispatch(runActionCreators.resumeTimer(timerIndex, false));
						break;

					case 'USER_RESUME':
						dispatch(runActionCreators.resumeTimer(timerIndex, true));
						break;

					case 'MAXTIME':
						dispatch(runActionCreators.timerMaximumChanged(timerIndex, timerArgument));
						break;

					default:
						break;
				}
			}
			break;

		case 'THEME':
			if (args.length > 1) {
				dispatch(runActionCreators.playersStateCleared());
				dispatch(runActionCreators.showmanReplicChanged(''));
				dispatch(tableActionCreators.showText(`${localization.theme}: ${args[1]}`, false));
				dispatch(runActionCreators.afterQuestionStateChanged(false));
				dispatch(runActionCreators.themeNameChanged(args[1]));
			}
			break;

		case 'TRY':
			dispatch(tableActionCreators.canPressChanged(true));
			break;

		case 'WINNER':
			// Not used - applause sound could be played here
			break;

		case 'WRONGTRY':
			{
				const index = parseInt(args[1], 10);
				const { players } = state.run.persons;
				if (index > -1 && index < players.length) {
					const player = players[index];
					if (player.state === PlayerStates.None) {
						dispatch(runActionCreators.playerStateChanged(index, PlayerStates.Lost));
						setTimeout(
							() => {
								dispatch(runActionCreators.playerLostStateDropped(index));
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
	dispatch(runActionCreators.selectionEnabled(indices, 'CAT'));
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

	dispatch(runActionCreators.setStakes(allowedStakeTypes, minimum, maximum, minimum, step, 'CATCOST', true));
	dispatch(runActionCreators.decisionNeededChanged(true));
}

function onChoose(dispatch: Dispatch<any>) {	
	dispatch(runActionCreators.decisionNeededChanged(true));
	dispatch(tableActionCreators.isSelectableChanged(true));
}

function onStake(dispatch: Dispatch<any>, state: State, args: string[], maximum: number) {
	{
		const allowedStakeTypes = {
			[StakeTypes.Nominal]: args[1] === '+',
			[StakeTypes.Sum]: args[2] === '+',
			[StakeTypes.Pass]: args[3] === '+',
			[StakeTypes.AllIn]: args[4] === '+'
		};

		const minimum = parseInt(args[5], 10);

		dispatch(runActionCreators.setStakes(allowedStakeTypes, minimum, maximum, minimum, 100, 'STAKE', false));
		dispatch(runActionCreators.decisionNeededChanged(true));
	}
}

const playerHandler = (dispatch: Dispatch<any>, state: State, dataContext: DataContext, args: string[]) => {
	switch (args[0]) {
		case 'ANSWER':
			dispatch(runActionCreators.isAnswering());
			break;

		case 'CANCEL':
			dispatch(runActionCreators.clearDecisions());
			break;

		case 'CAT':
			onCat(dispatch, args);
			break;

		case 'CATCOST':
			onCatCost(dispatch, args);
			break;

		case 'CHOOSE':
			onChoose(dispatch);
			break;

		case 'FINALSTAKE':
			{
				const me = getMe(state);

				if (!me) {
					break;
				}

				const allowedStakeTypes = {
					[StakeTypes.Nominal]: false,
					[StakeTypes.Sum]: true,
					[StakeTypes.Pass]: false,
					[StakeTypes.AllIn]: false
				};

				dispatch(runActionCreators.setStakes(allowedStakeTypes, 1, me.sum, 1, 1, 'FINALSTAKE', true));
				dispatch(runActionCreators.decisionNeededChanged(true));
			}
			break;

		case 'REPORT':
			// TODO: process
			break;

		case 'STAKE':
			const me = getMe(state);

			if (!me) {
				return;
			}

			onStake(dispatch, state, args, me.sum);
			break;

		case 'VALIDATION':
			startValidation(dispatch, localization.apellation, args);
			break;

		default:
			break;
	}
};

const showmanHandler = (dispatch: Dispatch<any>, state: State, dataContext: DataContext, args: string[]) => {
	switch (args[0]) {
		case 'CANCEL':
			dispatch(runActionCreators.clearDecisions());
			break;

		case 'FIRST': {
			const indices = getIndices(args);
			dispatch(runActionCreators.selectionEnabled(indices, 'FIRST'));
			dispatch(runActionCreators.showmanReplicChanged(localization.selectFirstPlayer));
			break;
		}

		case 'FIRSTDELETE': {
			const indices = getIndices(args);
			dispatch(runActionCreators.selectionEnabled(indices, 'NEXTDELETE'));
			dispatch(runActionCreators.showmanReplicChanged(localization.selectThemeDeleter));
			break;
		}

		case 'FIRSTSTAKE': {
			const indices = getIndices(args);
			dispatch(runActionCreators.selectionEnabled(indices, 'NEXT'));
			dispatch(runActionCreators.showmanReplicChanged(localization.selectStaker));
			break;
		}

		case 'HINT':
			if (args.length > 1) {
				dispatch(runActionCreators.hintChanged(`${localization.rightAnswer}: ${args[1]}`));
			}
			break;

		case 'RIGHTANSWER':
			dispatch(runActionCreators.hintChanged(null));
			break;

		case 'STAGE':
			dispatch(runActionCreators.decisionNeededChanged(false));
			dispatch(runActionCreators.hintChanged(null));
			break;

		case 'VALIDATION':
			startValidation(dispatch, localization.answerChecking, args);
			break;

		// Player commands for oral game
		case 'CAT':
			onCat(dispatch, args);
			break;

		case 'CATCOST':
			onCatCost(dispatch, args);
			break;

		case 'CHOOSE':
			onChoose(dispatch);
			break;

		case 'STAKE':
			if (args.length < 6) {
				break;
			}

			const maximum = args.length > 6 ? args[6] : args[5];

			onStake(dispatch, state, args, parseInt(maximum, 10));
			break;

		default:
			break;
	}
};

function startValidation(dispatch: Dispatch<RunActions.KnownRunAction>, title: string, args: string[]) {
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
	dispatch(runActionCreators.validate(name, answer, right, wrong, title, validationMesssage));
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

function info(dispatch: Dispatch<RunActions.KnownRunAction>, ...args: string[]) {
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
			inGame: true
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

	dispatch(runActionCreators.infoChanged(all, showman, players));
	dispatch(actionCreators.sendAvatar() as any);
}

function onReplic(dispatch: Dispatch<RunActions.KnownRunAction>, state: State, args: string[]) {
	const personCode = args[1];

	let text = '';
	for (let i = 2; i < args.length; i++) {
		if (text.length > 0) {
			text += ' ';
		}

		text += args[i];
	}

	if (personCode === 's') {
		dispatch(runActionCreators.showmanReplicChanged(text));
		return;
	}

	if (personCode.startsWith('p') && personCode.length > 1) {
		const index = parseInt(personCode.substring(1), 10);
		dispatch(runActionCreators.playerReplicChanged(index, text));
		return;
	}

	if (personCode !== 'l') {
		return;
	}

	dispatch(runActionCreators.chatMessageAdded({ sender: null, text, level: MessageLevel.System }));
}

function connected(dispatch: Dispatch<RunActions.KnownRunAction>, state: State, ...args: string[]) {
	const name = args[3];
	if (name === state.user.login) {
		return;
	}

	const role = args[1];
	const index = parseInt(args[2], 10);
	const isMale = args[4] === '+';

	const account: Account = {
		name,
		sex: isMale ? Sex.Male : Sex.Female,
		isHuman: true,
		avatar: null
	};

	dispatch(runActionCreators.personAdded(account));

	switch (role) {
		case 'showman':
			dispatch(runActionCreators.showmanChanged(name, true, false));
			break;

		case 'player':
			dispatch(runActionCreators.playerChanged(index, name, true, false));
			break;

		default:
			break;
	}
}

function disconnected(dispatch: Dispatch<RunActions.KnownRunAction>, state: State, ...args: string[]) {
	const name = args[1];

	dispatch(runActionCreators.personRemoved(name));

	if (state.run.persons.showman.name === name) {
		dispatch(runActionCreators.showmanChanged(Constants.ANY_NAME, null, false));
	} else {
		for (let i = 0; i < state.run.persons.players.length; i++) {
			if (state.run.persons.players[i].name === name) {
				dispatch(runActionCreators.playerChanged(i, Constants.ANY_NAME, null, false));
				break;
			}
		}
	}
}

function config(dispatch: Dispatch<RunActions.KnownRunAction>, state: State, ...args: string[]) {
	switch (args[1]) {
		case 'ADDTABLE':
			dispatch(runActionCreators.playerAdded());
			break;

		case 'FREE': {
			const personType = args[2];
			const index = parseInt(args[3], 10);

			const isPlayer = personType === 'player';
			dispatch(isPlayer
				? runActionCreators.playerChanged(index, Constants.ANY_NAME, null, false)
				: runActionCreators.showmanChanged(Constants.ANY_NAME, null, false));
			
			const account = isPlayer ? state.run.persons.players[index] : state.run.persons.showman;

			if (account.name === state.user.login) {
				dispatch(runActionCreators.roleChanged(Role.Viewer));
			}

			break;
		}

		case 'DELETETABLE': {
			const index = parseInt(args[2], 10);
			const player = state.run.persons.players[index];
			const person = state.run.persons.all[player.name];

			dispatch(runActionCreators.playerDeleted(index));

			if (person && !person.isHuman) {
				dispatch(runActionCreators.personRemoved(person.name));
			} else if (player.name === state.user.login) {
				dispatch(runActionCreators.roleChanged(Role.Viewer));
			}

			break;
		}

		case 'SET': {
			const personType = args[2];
			const index = parseInt(args[3], 10);
			const replacer = args[4];
			const replacerSex = args[5] === '+' ? Sex.Male : Sex.Female;

			const isPlayer = personType === 'player';
			const account = isPlayer ? state.run.persons.players[index] : state.run.persons.showman;
			const person = state.run.persons.all[account.name];

			if (person && !person.isHuman) {
				dispatch(isPlayer
					? runActionCreators.playerChanged(index, replacer, null, false)
					: runActionCreators.showmanChanged(replacer, null, false));
				
				dispatch(runActionCreators.personRemoved(person.name));

				const newAccount: Account = {
					name: replacer,
					isHuman: false,
					sex: replacerSex,
					avatar: null
				};

				dispatch(runActionCreators.personAdded(newAccount));
				break;
			}

			if (state.run.persons.showman.name === replacer) { // isPlayer
				dispatch(runActionCreators.showmanChanged(account.name, true, account.isReady));
				dispatch(runActionCreators.playerChanged(index, replacer, true, state.run.persons.showman.isReady));

				if (account.name === state.user.login) {
					dispatch(runActionCreators.roleChanged(Role.Showman));
				} else if (replacer === state.user.login) {
					dispatch(runActionCreators.roleChanged(Role.Player));
				}

				break;
			}

			for (let i = 0; i < state.run.persons.players.length; i++) {
				if (state.run.persons.players[i].name === replacer) {
					if (isPlayer) {
						dispatch(runActionCreators.playersSwap(index, i));
					} else {
						const { isReady } = state.run.persons.players[i];

						dispatch(runActionCreators.playerChanged(i, account.name, null, account.isReady));
						dispatch(runActionCreators.showmanChanged(replacer, null, isReady));

						if (state.run.persons.showman.name === state.user.login) {
							dispatch(runActionCreators.roleChanged(Role.Player));
						} else if (replacer === state.user.login) {
							dispatch(runActionCreators.roleChanged(Role.Showman));
						}
					}

					return;
				}
			}

			dispatch(isPlayer
				? runActionCreators.playerChanged(index, replacer, null, false)
				: runActionCreators.showmanChanged(replacer, null, false));

			if (account.name === state.user.login) {
				dispatch(runActionCreators.roleChanged(Role.Viewer));
			} else if (replacer === state.user.login) {
				dispatch(runActionCreators.roleChanged(isPlayer ? Role.Player : Role.Showman));
			}

			break;
		}

		case 'CHANGETYPE': {
			const personType = args[2];
			const index = parseInt(args[3], 10);
			const newType = args[4] === '+';
			const newName = args[5];
			const newSex = args[6] === '+' ? Sex.Male : Sex.Female;

			const isPlayer = personType === 'player';
			const account = isPlayer ? state.run.persons.players[index] : state.run.persons.showman;
			const person = state.run.persons.all[account.name];

			if (person && person.isHuman === newType) {
				break;
			}

			if (!newType) {
				const newAccount: Account = {
					name: newName,
					isHuman: false,
					sex: newSex,
					avatar: null
				};

				dispatch(runActionCreators.personAdded(newAccount));
			}

			dispatch(isPlayer
				? runActionCreators.playerChanged(index, newName, newType, false)
				: runActionCreators.showmanChanged(newName, newType, false));
			
			if (newType) {
				dispatch(runActionCreators.personRemoved(person.name));
			}

			if (person.name === state.user.login) {
				dispatch(runActionCreators.roleChanged(Role.Viewer));
			}

			break;
		}

		default:
			break;
	}
}

function getMe(state: State): PlayerInfo | null {
	const { players } = state.run.persons;
	for (let i = 0; i < players.length; i++) {
		if (players[i].name === state.user.login) {
			return players[i];
		}
	}

	return null;
}
