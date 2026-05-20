import * as React from 'react';
import { connect, shallowEqual } from 'react-redux';
import { Action, Dispatch } from 'redux';
import State from '../../../state/State';
import PlayersView from '../../game/PlayersView/PlayersView';
import GameTable from '../../gameTable/GameTable/GameTable';
import {
	GameChatView,
	SideControlPanel,
	ShowmanReplicView,
	PersonsDialog,
	GameLogView,
	AnswerValidation,
	RoundProgress,
	PersonsView,
	ManageGameView,
	GameMetadataView,
	BannedView,
	ChatInput,
	GameState
} from '../../game';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Dialog from '../../common/Dialog/Dialog';
import Constants from '../../../model/enums/Constants';
import TableContextView from '../../tableContext/TableContextView/TableContextView';
import { userErrorChanged } from '../../../state/commonSlice';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DecisionType, DialogView, rejectAnswer, setChatVisibility } from '../../../state/room2Slice';
import ComplainDialog from '../../panels/ComplainDialog/ComplainDialog';
import Role from '../../../model/Role';
import Link from '../../common/Link/Link';
import Path from '../../../model/enums/Path';
import { navigate } from '../../../utils/Navigator';
import { analytics } from '../../../Index';
import { logEvent } from 'firebase/analytics';

import './Room.css';
import closeSvg from '../../../../assets/images/close.svg';

/**
 * Properties for the main Room component.
 */
interface RoomProps {
	/** Indicates whether the persons (members) dialog is currently visible. */
	isPersonsDialogVisible: boolean;
	/** Indicates whether the banned players dialog is currently visible. */
	isBannedDialogVisible: boolean;
	/** Indicates whether the game info/metadata dialog is currently visible. */
	isGameInfoDialogVisible: boolean;
	/** Indicates whether the manage game dialog is currently visible. */
	isManageGameDialogVisible: boolean;

	/** Callback triggered when the persons dialog should be closed. */
	onPersonsDialogClose: () => void;
	/** Callback triggered when the banned players dialog should be closed. */
	onBannedDialogClose: () => void;
	/** Callback triggered when the game info dialog should be closed. */
	onGameInfoDialogClose: () => void;
	/** Callback triggered when the manage game dialog should be closed. */
	onManageGameDialogClose: () => void;
	/** Clears all pending stage decisions in the room. */
	clearDecisions: () => void;
}

function getDialog(dialogView: DialogView): JSX.Element | null {
	switch (dialogView) {
		case DialogView.None:
			return null;

		case DialogView.Complain:
			return <ComplainDialog />;
		default:
			return null;
	}
}

const mapStateToProps = (state: State) => ({
	isPersonsDialogVisible: state.room.personsVisible,
	isBannedDialogVisible: state.room.bannedVisible,
	isGameInfoDialogVisible: state.room.gameInfoVisible,
	isManageGameDialogVisible: state.room.manageGameVisible,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPersonsDialogClose: () => {
		dispatch(roomActionCreators.runHidePersons());
	},
	onBannedDialogClose: () => {
		dispatch(roomActionCreators.runHideBanned());
	},
	onGameInfoDialogClose: () => {
		dispatch(roomActionCreators.runHideGameInfo());
	},
	onManageGameDialogClose: () => {
		dispatch(roomActionCreators.runHideManageGame());
	},
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function Room(props: RoomProps): JSX.Element {
	const appDispatch = useAppDispatch();

	// Combine selectors to minimize selector calls
	const { windowWidth, returnToLobby } = useAppSelector((state) => ({
		windowWidth: state.ui.windowWidth,
		returnToLobby: state.ui.navigation.returnToLobby,
	}), shallowEqual);

	const { floatingControls, backgroundImageKey } = useAppSelector((state) => ({
		floatingControls: state.settings.floatingControls,
		backgroundImageKey: state.settings.theme.room.backgroundImageKey,
	}), shallowEqual);

	const {
		kicked,
		chatIsVisible,
		decisionType,
		validationQueueLength,
		validationHeader,
		role,
		dialogView,
		deepMode,
		hostName,
		myName,
	} = useAppSelector((state) => ({
		kicked: state.room2.kicked,
		chatIsVisible: state.room2.chat.isVisible,
		decisionType: state.room2.stage.decisionType,
		validationQueueLength: state.room2.validation.queue.length,
		validationHeader: state.room2.validation.header,
		role: state.room2.role,
		dialogView: state.room2.dialogView,
		deepMode: state.room2.deepMode,
		hostName: state.room2.persons.hostName,
		myName: state.room2.name,
	}), shallowEqual);

	React.useEffect(() => {
		if (kicked) {
			appDispatch(userErrorChanged(localization.youAreKicked));
			appDispatch(navigate({ navigation: { path: returnToLobby ? Path.Lobby : Path.Menu }, saveState: true }));
		}
	}, [kicked, returnToLobby, appDispatch]);

	const isScreenWide = windowWidth >= Constants.WIDE_WINDOW_WIDTH; // TODO: try to replace with CSS

	React.useEffect(() => {
		if (analytics && isScreenWide) {
			logEvent(analytics, 'donate_impression');
		}
	}, [isScreenWide]);

	const onDonateClick = () => {
		if (analytics) {
			logEvent(analytics, 'donate_click');
		}
	};

	const onReject = (factor: number) => {
		appDispatch(rejectAnswer(factor));
		props.clearDecisions();
	};

	const isHost = myName === hostName;

	let img: JSX.Element | null = null;

	if (backgroundImageKey) {
		const base64 = localStorage.getItem(Constants.STUDIA_BACKGROUND_KEY);

		if (base64) {
			img = <img className='studiaBackground' alt='studia background' src={`data:image/png;base64, ${base64}`} />;
		}
	}

	return (
		<section className={`gameMain ${deepMode ? 'deepMode' : ''}`}>
			{img}
			<div className={`game__tableArea ${deepMode && isScreenWide && !isHost ? 'noSidePanel' : ''}`}>
				<div className={`gameMainView ${isScreenWide && !deepMode ? 'reversed' : ''}`}>
					{!deepMode && <PlayersView />}

					<div className="showmanTableArea">
						<div className="showmanProgressArea">
							<div className='progressArea'>
								<GameState />
								<RoundProgress />

								<div className="donateLink">
									<Link
										href='https://vladimirkhil.com/donate'
										target='_blank'
										rel='noreferrer noopener'
										title='https://vladimirkhil.com/donate'
										onClick={onDonateClick}
									>
										<span className="donateHeart">❤</span> {localization.donateServersHosting}
									</Link>
								</div>
							</div>

							<ShowmanReplicView />
						</div>

						<div className="tableArea">
							<GameTable />
							<TableContextView />

							{chatIsVisible && !isScreenWide ? (
								<div className="compactChatView">
									<div className='compactChatHeader'>{localization.chat}</div>

									<button
										type="button"
										className="dialog_closeButton"
										onClick={() => appDispatch(setChatVisibility(false))}
										title={localization.close}>
										<img src={closeSvg} alt={localization.close} />
									</button>

									<div className="sideArea">
										<div className="game__chat">
											<GameLogView />
										</div>
									</div>

									<ChatInput />
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>

			{(!deepMode || isHost || !isScreenWide) && (
				<div className={`game__mainArea ${floatingControls && isScreenWide ? 'floatable' : ''} ${deepMode ? 'deepMode' : ''}`}>
					{isScreenWide ? <GameChatView /> : null}
					<SideControlPanel />
				</div>
			)}

			{/* TODO: Switch to a single enum here */}

			{props.isPersonsDialogVisible && !isScreenWide ? (
				<PersonsDialog title={localization.members} onClose={props.onPersonsDialogClose}>
					<PersonsView />
				</PersonsDialog>
			) : null}

			{props.isBannedDialogVisible && !isScreenWide ? (
				<PersonsDialog title={localization.bannedList} onClose={props.onBannedDialogClose}>
					<BannedView />
				</PersonsDialog>
			) : null}

			{props.isGameInfoDialogVisible && !isScreenWide ? (
				<Dialog className='gameInfoDialog' title={localization.gameInfo} onClose={props.onGameInfoDialogClose}>
					<GameMetadataView />
				</Dialog>
			) : null}

			{props.isManageGameDialogVisible && !isScreenWide ? (
				<Dialog className='manageGameDialog' title={localization.game} onClose={props.onManageGameDialogClose}>
					<ManageGameView onClose={props.onManageGameDialogClose} />
				</Dialog>
			) : null}

			{decisionType === DecisionType.Validation &&
				validationQueueLength > 0 &&
				!isScreenWide &&
				role === Role.Showman ? (
				<Dialog className='answerValidationDialog' title={validationHeader} onClose={() => onReject(1.0)}>
					<AnswerValidation />
				</Dialog>
			) : null}
			{getDialog(dialogView)}
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
