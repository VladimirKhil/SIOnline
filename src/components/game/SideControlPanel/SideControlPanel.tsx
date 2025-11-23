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

import { addTable,
	DecisionType,
	selectPlayers,
	setAreSumsEditable,
	setChatVisibility,
	setDecisionType,
	setIsEditingTables } from '../../../state/room2Slice';

import { showProfile, showSettings } from '../../../state/uiSlice';
import Constants from '../../../model/enums/Constants';
import { pauseGame } from '../../../state/serverActions';

import './SideControlPanel.css';
import nextImg from '../../../../assets/images/next.png';
import pauseImg from '../../../../assets/images/pause.png';
import exitImg from '../../../../assets/images/exit.png';
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
	const { chat, stage, role, roundsNames, areSumsEditable, lastReplic, persons } = useAppSelector(state => ({
		chat: state.room2.chat,
		stage: state.room2.stage,
		role: state.room2.role,
		roundsNames: state.room2.roundsNames,
		areSumsEditable: state.room2.areSumsEditable,
		lastReplic: state.room2.lastReplic,
		persons: state.room2.persons,
	}));

	const ui = useAppSelector(state => state.ui);

	const chatButtonStyle: React.CSSProperties = chat.isActive ? {
		backgroundColor: 'lightyellow'
	} : {};

	const gameMenuHostStyle: React.CSSProperties = {
		flex: '1 0 0'
	};

	const pauseTitle = stage.isGamePaused ? localization.resume : localization.pause;
	const canPause = props.isHost || role === Role.Showman;

	const enabledClass = props.isConnected ? '' : 'disabled';
	const enabledManagementClass = props.isConnected && roundsNames.length >= 2 ? '' : 'disabled';

	const { voiceChatUri } = props;
	const canAddTable = persons.players.length < Constants.MAX_PLAYER_COUNT;

	const canStart = !stage.isGameStarted && props.isHost;

	const onGiveTurn = () =>{
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

	return (
		<div className="game__utilsArea">
			<div className="gameMessageHost">
				<div className='sidecontrol_buttons'>
					<div className="gameMenuHost" style={gameMenuHostStyle}>
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

											{stage.isGameStarted
												? <li onClick={() => appDispatch(setIsEditingTables(!stage.isEditingTables))}>
													{localization.editTables}
												</li>
												: null}
										</>
										: null}

									<li onClick={() => props.onShowBanned()}>{localization.bannedList}</li>
									<li onClick={() => props.onShowGameInfo()}>{localization.gameInfo}</li>

									{role === Role.Showman ? (
										<li className={enabledClass} onClick={onGiveTurn}>{localization.giveTurn}</li>
										) : null}

									{voiceChatUri && isWellFormedUri(voiceChatUri) ? (
										<li title={voiceChatUri} onClick={() => window.open(voiceChatUri, '_blank')}>{localization.voiceChat}</li>
									) : null}

									<li onClick={() => appDispatch(showSettings(true))}>{localization.settings}</li>
									<li onClick={() => appDispatch(showProfile(true))}>{localization.profile}</li>
								</ul>
							)}
							theme={FlyoutTheme.Dark}
							alignWidth
							verticalOrientation={FlyoutVerticalOrientation.Top}
						>
							<span>…</span>
						</FlyoutButton>
					</div>

					<button
						type="button"
						className={`standard imageButton showChat ${chat.isVisible ? 'active' : ''}`}
						onClick={() => appDispatch(setChatVisibility(!chat.isVisible))}
						style={chatButtonStyle}
						title={localization.showChat}
					>
						<span>💬</span>
					</button>

					{canPause ? (
						<button
							type="button"
							className={`pauseButton standard imageButton ${stage.isGamePaused ? 'active' : ''}`}
							title={pauseTitle}
							disabled={!props.isConnected || !stage.isGameStarted}
							onClick={() => appDispatch(pauseGame())}
						>
							<img alt='pause' src={pauseImg} />
						</button>
					) : null}

					{props.isHost ? (
						<button
							type="button"
							className={`nextButton standard imageButton ${canStart ? 'startButton' : ''}`}
							title={canStart ? localization.startGameHint : localization.next}
							onClick={canStart ? props.onStart : moveNext}>
							{canStart ? <span role="img" aria-label="arrow right">▶</span> : <img alt='Next' src={nextImg} />}
						</button>
					) : null}

					<FlyoutButton
						className="exit standard imageButton"
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
