import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import State from '../../../state/State';
import PlayersView from '../../game/PlayersView/PlayersView';
import GameTable from '../../gameTable/GameTable/GameTable';
import GameChatView from '../../game/GameChatView/GameChatView';
import SideControlPanel from '../../game/SideControlPanel/SideControlPanel';
import ShowmanReplicView from '../../game/ShowmanReplicView/ShowmanReplicView';
import PersonsDialog from '../../game/PersonsDialog/PersonsDialog';
import GameLogView from '../../game/GameLogView/GameLogView';
import AnswerValidation from '../../game/AnswerValidation/AnswerValidation';
import RoundProgress from '../../game/RoundProgress/RoundProgress';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import PersonsView from '../../game/PersonsView/PersonsView';
import Dialog from '../../common/Dialog/Dialog';
import ManageGameView from '../../game/ManageGameView/ManageGameView';
import Constants from '../../../model/enums/Constants';
import GameMetadataView from '../../game/GameMetadataView/GameMetadataView';
import BannedView from '../../game/BannedView/BannedView';
import TableContextView from '../../tableContext/TableContextView/TableContextView';
import ChatInput from '../../game/ChatInput/ChatInput';
import { userErrorChanged } from '../../../state/commonSlice';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DecisionType, DialogView, rejectAnswer, setChatVisibility } from '../../../state/room2Slice';
import ComplainDialog from '../../panels/ComplainDialog/ComplainDialog';
import GameState from '../../game/GameState/GameState';
import Role from '../../../model/Role';
import Link from '../../common/Link/Link';
import Path from '../../../model/enums/Path';
import { navigate } from '../../../utils/Navigator';

import './Room.css';
import closeSvg from '../../../../assets/images/close.svg';

interface RoomProps {
	isPersonsDialogVisible: boolean;
	isBannedDialogVisible: boolean;
	isGameInfoDialogVisible: boolean;
	isManageGameDialogVisible: boolean;

	onPersonsDialogClose: () => void;
	onBannedDialogClose: () => void;
	onGameInfoDialogClose: () => void;
	onManageGameDialogClose: () => void;
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
	}));

	const { floatingControls, backgroundImageKey } = useAppSelector((state) => ({
		floatingControls: state.settings.floatingControls,
		backgroundImageKey: state.settings.theme.room.backgroundImageKey,
	}));

	const {
		kicked,
		chatIsVisible,
		decisionType,
		validationQueueLength,
		validationHeader,
		role,
		dialogView,
	} = useAppSelector((state) => ({
		kicked: state.room2.kicked,
		chatIsVisible: state.room2.chat.isVisible,
		decisionType: state.room2.stage.decisionType,
		validationQueueLength: state.room2.validation.queue.length,
		validationHeader: state.room2.validation.header,
		role: state.room2.role,
		dialogView: state.room2.dialogView,
	}));

	React.useEffect(() => {
		if (kicked) {
			appDispatch(userErrorChanged(localization.youAreKicked));
			appDispatch(navigate({ navigation: { path: returnToLobby ? Path.Lobby : Path.Menu }, saveState: true }));
		}
	}, [kicked, returnToLobby, appDispatch]);

	const isScreenWide = windowWidth >= Constants.WIDE_WINDOW_WIDTH; // TODO: try to replace with CSS

	const onReject = (factor: number) => {
		appDispatch(rejectAnswer(factor));
		props.clearDecisions();
	};

	let img: JSX.Element | null = null;

	if (backgroundImageKey) {
		const base64 = localStorage.getItem(Constants.STUDIA_BACKGROUND_KEY);

		if (base64) {
			img = <img className='studiaBackground' alt='studia background' src={`data:image/png;base64, ${base64}`} />;
		}
	}

	return (
		<section className="gameMain">
			{img}
			<div className="game__tableArea">
				<div className={`gameMainView ${isScreenWide ? 'reversed' : ''}`}>
					<PlayersView />

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
									>
										{localization.donateServersHosting}
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

			<div className={`game__mainArea ${floatingControls && isScreenWide ? 'floatable' : ''}`}>
				{isScreenWide ? <GameChatView /> : null}
				<SideControlPanel />
			</div>

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
