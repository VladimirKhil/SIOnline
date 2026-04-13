import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../../state/State';
import roomActionCreators from '../../../state/room/roomActionCreators';
import localization from '../../../model/resources/localization';
import FlyoutButton, { FlyoutVerticalOrientation, FlyoutTheme, FlyoutHorizontalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import Role from '../../../model/Role';
import { isHost } from '../../../utils/StateHelpers';
import isWellFormedUri from '../../../utils/isWellFormedUri';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import {
	addTable,
	DecisionType,
	selectPlayers,
	setAreSumsEditable,
	setChatVisibility,
	setDecisionType,
	setIsEditingTables
} from '../../../state/room2Slice';

import Constants from '../../../model/enums/Constants';
import { pauseGame } from '../../../state/serverActions';

import './SideControlPanel.css';
import nextImg from '../../../../assets/images/next.png';
import pauseImg from '../../../../assets/images/pause.png';
import exitImg from '../../../../assets/images/exit.png';
import sumsImg from '../../../../assets/images/sums.png';
import activePlayerImg from '../../../../assets/images/active_player.png';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';

interface SideControlPanelProps {
	isConnected: boolean;
	isHost: boolean;
	areStakesVisible: boolean;
	voiceChatUri: string | null;

	onShowPersons: () => void;
	onShowBanned: () => void;
	onShowGameInfo: () => void;
	onGiveTurn: () => void;
	onMoveNext: () => void;
	showGameManageDialog: () => void;
	onStart: () => void;
	onPass: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	isHost: isHost(state),
	areStakesVisible: state.room.stakes.areVisible,
	voiceChatUri: state.room.metadata.voiceChatUri,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onShowPersons: () => {
		dispatch(roomActionCreators.runShowPersons());
	},
	onShowBanned: () => {
		dispatch(roomActionCreators.runShowBanned());
	},
	onShowGameInfo: () => {
		dispatch(roomActionCreators.runShowGameInfo());
	},
	onGiveTurn: () => {
		dispatch(roomActionCreators.giveTurn() as unknown as Action);
	},
	onMoveNext: () => {
		dispatch(roomActionCreators.moveNext() as unknown as Action);
	},
	showGameManageDialog: () => {
		dispatch(roomActionCreators.runShowManageGame());
	},
	onStart: () => {
		dispatch(roomActionCreators.startGame() as unknown as Action);
	},
	onPass: () => {
		dispatch(roomActionCreators.onPass() as unknown as Action);
	},
});

export function SideControlPanel(props: SideControlPanelProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const {
		chatIsActive,
		chatIsVisible,
		isGamePaused,
		isGameStarted,
		isEditingTables,
		role,
		roundsNames,
		areSumsEditable,
		lastReplic,
		playersCount,
		deepMode
	} = useAppSelector(state => ({
		chatIsActive: state.room2.chat.isActive,
		chatIsVisible: state.room2.chat.isVisible,
		isGamePaused: state.room2.stage.isGamePaused,
		isGameStarted: state.room2.stage.isGameStarted,
		isEditingTables: state.room2.stage.isEditingTables,
		role: state.room2.role,
		roundsNames: state.room2.roundsNames,
		areSumsEditable: state.room2.areSumsEditable,
		lastReplic: state.room2.lastReplic,
		playersCount: state.room2.persons.players.length,
		deepMode: state.room.deepMode,
	}));

	const ui = useAppSelector(state => state.ui);

	const pauseTitle = isGamePaused ? localization.resume : localization.pause;
	const canPause = props.isHost || role === Role.Showman;

	const enabledClass = props.isConnected ? '' : 'disabled';
	const enabledManagementClass = props.isConnected && roundsNames.length >= 2 ? '' : 'disabled';

	const { voiceChatUri } = props;
	const canAddTable = playersCount < Constants.MAX_PLAYER_COUNT;

	const canStart = !isGameStarted && props.isHost;
	const canEditTables = props.isConnected && isGameStarted;

	const onGiveTurn = () => {
		props.onGiveTurn();
		appDispatch(selectPlayers([]));
		appDispatch(setDecisionType(DecisionType.SelectChooser));
	};

	const moveNext = () => {
		props.onMoveNext();
		appDispatch(setAreSumsEditable(false));
	};

	const onExit = () => {
		appDispatch(navigate({ navigation: { path: ui.navigation.returnToLobby ? Path.Lobby : Path.Menu }, saveState: true }));
	};

	const isScreenWide = ui.windowWidth >= Constants.WIDE_WINDOW_WIDTH;
	const validVoiceChatUri = voiceChatUri !== null && isWellFormedUri(voiceChatUri) ? voiceChatUri : null;

	return (
		<div className="game__utilsArea">
			<div className="gameMessageHost">
				<div className='sidecontrol_buttons'>
					{!deepMode && (
						<div className="gameMenuHost">
							<FlyoutButton
								className="gameMenuButton imageButton"
								title={localization.menu}
								flyout={(
									<ul className="gameMenu">
										{role === Role.Showman
											? (
												<>
													<li
														className={`${enabledClass} ${areSumsEditable ? 'active' : ''}`}
														onClick={() => appDispatch(setAreSumsEditable(!areSumsEditable))}
													>
														{localization.changeSums}
													</li>

													<li
														className={enabledManagementClass}
														title={localization.gameManageHint}
														onClick={() => props.showGameManageDialog()}>
														{localization.game}
													</li>
												</>
											) : null}

										<li onClick={() => props.onShowPersons()}>{localization.members}</li>

										{props.isHost
											? <>
												{canAddTable ? <li onClick={() => appDispatch(addTable())}>{localization.addTable}</li> : null}

												{isGameStarted
													? <li onClick={() => appDispatch(setIsEditingTables(!isEditingTables))}>
														{localization.editTables}
													</li>
													: null}
											</>
											: null}

										<li onClick={() => props.onShowBanned()}>{localization.bannedList}</li>
										<li onClick={() => props.onShowGameInfo()}>{localization.gameInfo}</li>

										{validVoiceChatUri ? (
											<li
												title={validVoiceChatUri}
												onClick={() => window.open(validVoiceChatUri, '_blank')}>
												{localization.voiceChat}
											</li>
										) : null}
									</ul>
								)}
								theme={FlyoutTheme.Dark}
								alignWidth
								verticalOrientation={FlyoutVerticalOrientation.Top}
							>
								<span>…</span>
							</FlyoutButton>
						</div>
					)}

					{!deepMode && (
						<button
							type="button"
							className={`standard imageButton showChat ${chatIsVisible ? 'active' : ''} ${chatIsActive ? 'chat-active' : ''}`}
							onClick={() => appDispatch(setChatVisibility(!chatIsVisible))}
							title={localization.showChat}
						>
							<span>💬</span>
						</button>
					)}

					{props.isHost ? (
						<button
							type="button"
							className="sidecontrol_button addTableButton standard imageButton"
							disabled={!props.isConnected || !canAddTable}
							onClick={() => appDispatch(addTable())}
							title={localization.addTable}
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path
									d={
										'M9 2C6.79 2 5 3.79 5 6C5 8.21 6.79 10 9 10C11.21 10 13 8.21 13 6' +
										'C13 3.79 11.21 2 9 2Z'
									}
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path
									d={
										'M2 22V20C2 16.69 4.69 14 8 14H10C13.31 14 16 16.69 16 20V22'
									}
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path d="M20 3L20 9M17 6L23 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
							</svg>
						</button>
					) : null}

					{props.isHost ? (
						<button
							type="button"
							className={`sidecontrol_button editTablesButton standard imageButton ${isEditingTables ? 'active' : ''}`}
							disabled={!canEditTables}
							onClick={() => appDispatch(setIsEditingTables(!isEditingTables))}
							title={localization.editTables}
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path
									d={
										'M8 2C5.79 2 4 3.79 4 6C4 8.21 5.79 10 8 10C10.21 10 12 8.21 12 6' +
										'C12 3.79 10.21 2 8 2Z'
									}
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path
									d={
										'M1 22V20C1 16.69 3.69 14 7 14H9C12.31 14 15 16.69 15 20V22'
									}
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path d="M21 0L23 2L17 8L15 8L15 6Z" stroke="currentColor" strokeWidth="1" fill="currentColor" />
							</svg>
						</button>
					) : null}

					{role === Role.Showman ? (
						<button
							type="button"
							className="sidecontrol_button giveTurnButton standard imageButton"
							disabled={!props.isConnected}
							onClick={onGiveTurn}
							title={localization.giveTurn}
						>
							<img alt='Active player' src={activePlayerImg} />
						</button>
					) : null}

					{role === Role.Showman ? (
						<button
							type="button"
							className={`sidecontrol_button standard imageButton ${areSumsEditable ? 'active' : ''}`}
							disabled={!props.isConnected}
							onClick={() => appDispatch(setAreSumsEditable(!areSumsEditable))}
							title={localization.changeSums}
						>
							<img alt='sums' src={sumsImg} />
						</button>
					) : null}

					{canPause && (!deepMode || props.isHost) ? (
						<button
							type="button"
							className={`sidecontrol_button pauseButton standard imageButton ${isGamePaused ? 'active' : ''}`}
							title={pauseTitle}
							disabled={!props.isConnected || !isGameStarted}
							onClick={() => appDispatch(pauseGame())}
						>
							<img alt='pause' src={pauseImg} />
						</button>
					) : null}

					{props.isHost ? (
						<button
							type="button"
							className={`sidecontrol_button nextButton standard imageButton ${canStart ? 'startButton' : ''}`}
							title={canStart ? localization.startGameHint : localization.next}
							onClick={canStart ? props.onStart : moveNext}>
							{canStart ? <span role="img" aria-label="arrow right">▶</span> : <img alt='Next' src={nextImg} />}
						</button>
					) : (!deepMode && (
						<button
							type="button"
							className="sidecontrol_button nextButton standard imageButton"
							title={localization.next}
							disabled
						>
							<img alt='Next' src={nextImg} />
						</button>
					))}

					{(!deepMode || !isScreenWide) && (
						<FlyoutButton
							className="exit sidecontrol_button standard imageButton"
							title={localization.exit}
							flyout={(
								<div id="exitMenu" className="exitMenu">
									<div id="exitMenuPopup" className="gameMenuPopup">
										<p>{localization.exitConfirmation}</p>
										<ul>
											<li
												onClick={onExit}>
												{localization.exitFromGame}
											</li>
										</ul>
									</div>
								</div>
							)}
							theme={FlyoutTheme.Dark}
							alignWidth
							verticalOrientation={FlyoutVerticalOrientation.Top}
							horizontalOrientation={FlyoutHorizontalOrientation.Left}
						>
							<img alt='exit' src={exitImg} />
						</FlyoutButton>
					)}

				</div>
			</div>

			{lastReplic && lastReplic.text.length > 0 ? (
				<div id="lastReplic">
					<span>
						{lastReplic.sender ? (
							<span>
								<b>{lastReplic.sender}</b>
								<span>: </span>
							</span>
						) : null}
						{lastReplic.text}
					</span>
				</div>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideControlPanel);
