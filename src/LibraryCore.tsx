// Special entry file for using SIGame Online as a embedded library

import { AnyAction, Store, applyMiddleware, createStore } from 'redux';
import State, { initialState } from './state/State';
import reducer from './state/reducer';
import reduxThunk from 'redux-thunk';
import { HubConnectionBuilder } from '@microsoft/signalr';
import GameServerClient from './client/GameServerClient';
import GameClient from './client/game/GameClient';
import DataContext from './model/DataContext';
import ClientController from './logic/ClientController';
import TableMode from './model/enums/TableMode';
import BrowserHost from './host/BrowserHost';
import SIHostClient from './client/SIHostClient';
import localization from './model/resources/localization';
import Role from './model/Role';
import IGameClient from './client/game/IGameClient';
import { gameSoundPlayer } from './utils/GameSoundPlayer';
import GameSound from './model/enums/GameSound';
import { AppDispatch } from './state/store';
import { setAppSound, setTableBackgroundColor, setTableTextColor } from './state/settingsSlice';
import { loadState } from './state/SavedState';

declare global {
    interface Window {
        chrome: {
            webview: WebView;
        };
    }
}

interface WebViewEventListenerObject {
    handleEvent(object: Event & { data?: any }): void;
}

interface WebViewEventListener {
    (evt: Event & { data?: any }): void;
}

type WebViewEventListenerOrEventListenerObject = WebViewEventListener | WebViewEventListenerObject;

interface WebView extends EventTarget {
    /**
     * The standard EventTarget.addEventListener method. Use it to subscribe to the message event
     * or sharedbufferreceived event. The message event receives messages posted from the WebView2
     * host via CoreWebView2.PostWebMessageAsJson or CoreWebView2.PostWebMessageAsString. The
     * sharedbufferreceived event receives shared buffers posted from the WebView2 host via
     * CoreWebView2.PostSharedBufferToScript.
     * See CoreWebView2.PostWebMessageAsJson( Win32/C++, .NET, WinRT).
     * @param type The name of the event to subscribe to. Valid values are message, and sharedbufferreceived.
     * @param listener The callback to invoke when the event is raised.
     * @param options Options to control how the event is handled.
     */
    addEventListener(
        type: string,
        listener: WebViewEventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions): void;
}

function processMessage(controller: ClientController, payload: any, appDispatch: AppDispatch) {
	switch (payload.type) {
		case 'addPlayerTable':
			controller.addPlayerTable();
			break;

		case 'answerOption':
			controller.onAnswerOption(payload.index, payload.label, payload.contentType, payload.contentValue);
			break;

		case 'answerOptionsLayout':
			controller.onAnswerOptionsLayout(payload.questionHasScreenContent, payload.typeNames);
			break;

		case 'askAnswer':
			controller.onAskAnswer();
			break;

		case 'askStake':
			controller.onAskStake(payload.stakeModes, payload.minimum, payload.maximum, payload.step, payload.reason, payload.playerName);
			break;

		case 'beginPressButton':
			controller.onBeginPressButton();
			break;

		case 'cancel':
			controller.onCancel();
			break;

		case 'choose':
			controller.onChoose();
			break;

		case 'content':
			controller.onContent(payload.placement, payload.content);
			break;

		case 'contentState':
			controller.onContentState(payload.placement, payload.layoutId, payload.itemState);
			break;

		case 'deletePlayerTable':
			controller.deletePlayerTable(payload.index);
			break;

		case 'endPressButtonByPlayer':
			controller.onEndPressButtonByPlayer(payload.playerIndex);
			break;

		case 'endPressButtonByTimeout':
			controller.onEndPressButtonByTimeout();
			break;

		case 'finalThink':
			controller.onFinalThink();
			break;

		case 'gameThemes':
			controller.onGameThemes(payload.themes);
			break;

		case 'package':
			controller.onPackage(payload.packageName, payload.packageLogo);
			break;

		case 'pass':
			controller.onPass(payload.playerIndex);
			break;

		case 'pause':
			controller.onPause(payload.isPaused, payload.currentTime);
			break;

		case 'person':
			controller.onPerson(payload.playerIndex, payload.isRight);
			break;

		case 'playersVisibilityChanged':
			controller.onPlayersVisibilityChanged(payload.isVisible);
			break;

		case 'qrCode': // non-SIHost compatible API
			controller.onQrCode(payload.qrCode);
			break;

		case 'question':
			controller.onQuestion(payload.questionPrice);
			break;

		case 'questionEnd':
			controller.onQuestionEnd();
			break;

		case 'questionSelected':
			controller.onQuestionSelected(payload.themeIndex, payload.questionIndex);
			break;

		case 'questionType':
			controller.onQuestionType(payload.questionType, payload.isDefault, payload.isNoRisk);
			break;

		case 'setReadingSpeed': // non-SIHost compatible API
			controller.onOptionChanged('ReadingSpeed', payload.readingSpeed, '');
			break;

		case 'replic':
			controller.onReplic(payload.personCode, payload.text);
			break;

		case 'resumeMedia':
			controller.onResumeMedia();
			break;

		case 'rightAnswer':
			controller.onRightAnswer(payload.answer);
			break;

		case 'rightAnswerStart':
			controller.onRightAnswerStart(payload.answer);
			break;

		case 'roundThemes':
			controller.onRoundThemes(payload.themes, payload.playMode);
			break;

		case 'setChooser':
			controller.onSetChooser(payload.chooserIndex, payload.setAnswerer, true);
			break;

		case 'setAttachContentToTable':
			controller.onSetAttachContentToTable(payload.attach);
			break;

		case 'setLanguage': // non-SIHost compatible API
			localization.setLanguage(payload.language);
			break;

		case 'setAppSound': // non-SIHost compatible API
			appDispatch(setAppSound(payload.isEnabled));
			break;

		case 'setOptions': // non-SIHost compatible API
			appDispatch(setTableTextColor(payload.tableTextColor));
			appDispatch(setTableBackgroundColor(payload.tableBackgroundColor));
			break;

		case 'setSoundMap': // non-SIHost compatible API
			Object.keys(payload.soundMap).forEach((key: string) => gameSoundPlayer.setSound(
				key as any as GameSound,
				payload.soundMap[key]
			));
			break;

		case 'showTable':
			controller.onShowTable();
			break;

		case 'stage':
			controller.onStage(payload.stage, payload.stageName, payload.stageIndex, payload.rules);
			break;

		case 'stop':
			controller.onStop();
			break;

		case 'sum': // non-SIHost compatible API
			controller.onSum(payload.playerIndex, payload.value);
			break;

		case 'sums':
			controller.onSums(payload.sums);
			break;

		case 'table':
			controller.onTable(payload.table);
			break;

		case 'tableCaption':
			controller.onTableCaption(payload.caption);
			break;

		case 'tableChangeType':
			controller.onTableChangeType(payload.role, payload.index, payload.isHuman, payload.name, payload.sex);
			break;

		case 'tableSet':
			controller.onTableSet(payload.role, payload.index, payload.replacer, payload.replacerSex);
			break;

		case 'theme':
			controller.onTheme(payload.themeName, payload.animate);
			break;

		case 'themeComments':
			controller.onThemeComments(payload.themeComments);
			break;

		case 'themeDeleted':
			controller.onThemeDeleted(payload.themeIndex);
			break;

		case 'timerMaximum':
			controller.onTimerMaximumChanged(payload.timerIndex, payload.maximum);
			break;

		case 'timerPause':
			controller.onTimerPause(payload.timerIndex, payload.currentTime);
			break;

		case 'timerResume':
			controller.onTimerResume(payload.timerIndex);
			break;

		case 'timerRun':
			controller.onTimerRun(payload.timerIndex, payload.timerArgument, payload.timerPersonIndex);
			break;

		case 'timerStop':
			controller.onTimerStop(payload.timerIndex);
			break;

		case 'toggle':
			controller.onToggle(payload.themeIndex, payload.questionIndex, payload.price);
			break;

		case 'wrongTry':
			controller.onWrongTry(payload.playerIndex);
			break;

		default:
			break;
	}
}

export default function runCore(game?: IGameClient): Store<State, AnyAction> {
	const noOpHubConnection = new HubConnectionBuilder().withUrl('http://fake').build();

	const gameClient = new GameServerClient('');

	const dataContext: DataContext = {
		config: {
			siStatisticsServiceUri: '',
			appRegistryServiceUri: '',
		},
		serverUri: '',
		gameClient,
		game: game ?? new GameClient(new SIHostClient(noOpHubConnection, () => { }), false),
		contentUris: null,
		contentClients: [],
		storageClients: [],
		host: new BrowserHost(),
	};

	const savedState = loadState();

	const store = createStore<State, AnyAction, {}, {}>(
		reducer,
		{
			...initialState,
			table: {
				...initialState.table,
				mode: TableMode.Void,
			},
			room2: {
				...initialState.room2,
				role: Role.Showman,
			},
			user: {
				...initialState.user,
				login: savedState?.login ?? '',
			},
		},
		applyMiddleware(reduxThunk.withExtraArgument(dataContext))
	);

	const appDispatch = store.dispatch;
	const controller = new ClientController(store.dispatch, appDispatch, store.getState, dataContext);

	if (window.chrome) {
		const { webview } = window.chrome;

		if (webview) {
			webview.addEventListener('message', event => {
				const payload = event.data;
				processMessage(controller, payload, appDispatch);
			});
		}
	}

	return store;
}