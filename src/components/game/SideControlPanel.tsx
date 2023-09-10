import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import roomActionCreators from '../../state/room/roomActionCreators';
import localization from '../../model/resources/localization';
import FlyoutButton, { FlyoutVerticalOrientation, FlyoutTheme, FlyoutHorizontalOrientation } from '../common/FlyoutButton';
import Role from '../../client/contracts/Role';
import ChatMessage from '../../model/ChatMessage';
import ChatInput from './ChatInput';
import SendPassButton from './stakes/SendPassButton';
import SendStakeButton from './stakes/SendStakeButton';
import SendAllInButton from './stakes/SendAllInButton';
import { isHost } from '../../utils/StateHelpers';
import uiActionCreators from '../../state/ui/uiActionCreators';
import isWellFormedUri from '../../utils/isWellFormedUri';

import './SideControlPanel.css';
import nextImg from '../../../assets/images/next.png';
import pauseImg from '../../../assets/images/pause.png';
import exitImg from '../../../assets/images/exit.png';

interface SideControlPanelProps {
	isConnected: boolean;
	role: Role;
	isChatVisible: boolean;
	isChatActive: boolean;
	isHost: boolean;
	hasGameStarted: boolean;
	isPaused: boolean;
	isEditEnabled: boolean;
	lastReplic: ChatMessage | null;
	areStakesVisible: boolean;
	areSumsEditable: boolean;
	roundsNames: string[] | null;
	voiceChatUri: string | null;

	onChatVisibilityChanged: (isOpen: boolean) => void;
	onMarkQuestion: () => void;
	onShowPersons: () => void;
	onShowTables: () => void;
	onShowBanned: () => void;
	onShowGameInfo: () => void;
	onPause: () => void;
	onEditTable: () => void;
	onGiveTurn: () => void;
	onExit: () => void;
	onEditSums: (enable: boolean) => void;
	onMoveNext: () => void;
	showGameManageDialog: () => void;
	onStart: () => void;
	onPass: () => void;
	onShowSettings: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	role: state.room.role,
	isChatVisible: state.room.chat.isVisible,
	isChatActive: state.room.chat.isActive,
	isHost: isHost(state),
	hasGameStarted: state.room.stage.isGameStarted,
	isPaused: state.room.stage.isGamePaused,
	isEditEnabled: state.room.stage.isEditEnabled,
	lastReplic: state.room.lastReplic,
	areStakesVisible: state.room.stakes.areVisible,
	areSumsEditable: state.room.areSumsEditable,
	roundsNames: state.room.roundsNames,
	voiceChatUri: state.room.metadata.voiceChatUri,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatVisibilityChanged: (isOpen: boolean) => {
		dispatch(roomActionCreators.runChatVisibilityChanged(isOpen));
	},
	onMarkQuestion: () => {
		dispatch(roomActionCreators.markQuestion() as unknown as Action);
	},
	onShowPersons: () => {
		dispatch(roomActionCreators.runShowPersons());
	},
	onShowTables: () => {
		dispatch(roomActionCreators.runShowTables());
	},
	onShowBanned: () => {
		dispatch(roomActionCreators.runShowBanned());
	},
	onShowGameInfo: () => {
		dispatch(roomActionCreators.runShowGameInfo());
	},
	onPause: () => {
		dispatch(roomActionCreators.pause() as unknown as Action);
	},
	onEditTable: () => {
		dispatch(roomActionCreators.editTable());
	},
	onGiveTurn: () => {
		dispatch(roomActionCreators.giveTurn() as unknown as Action);
	},
	onExit: () => {
		dispatch(roomActionCreators.exitGame() as unknown as Action);
	},
	onEditSums: (enable: boolean) => {
		dispatch(roomActionCreators.areSumsEditableChanged(enable) as unknown as Action);
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
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
});

export function SideControlPanel(props: SideControlPanelProps): JSX.Element {
	const chatButtonStyle: React.CSSProperties = props.isChatActive ? {
		backgroundColor: 'lightyellow'
	} : {};

	const gameMenuHostStyle: React.CSSProperties = {
		flex: props.isHost ? '2 0 0' : '1 0 0 '
	};

	const pauseTitle = props.isPaused ? localization.resume : localization.pause;
	const canPause = props.isHost || props.role === Role.Showman;

	const enabledClass = props.isConnected ? '' : 'disabled';
	const enabledManagementClass = props.isConnected && props.roundsNames && props.roundsNames.length >= 2 ? '' : 'disabled';
	const enabledEditClass = props.isConnected && props.isPaused ? '' : 'disabled';

	const canStart = !props.hasGameStarted && props.isHost;

	const { voiceChatUri } = props;

	return (
		<div className="game__utilsArea">
			<div className="gameMessageHost">
				<div className="messageWrapper">
					<ChatInput />

					<button
						type="button"
						className='standard'
						id="showChat"
						onClick={() => props.onChatVisibilityChanged(!props.isChatVisible)}
						style={chatButtonStyle}
						title={localization.showChat}
					>
						<span>{props.isChatVisible ? '▼' : '▲'}</span>
					</button>
				</div>

				<div className="sidecontrol_buttons">
					{canPause ? (
						<button
							type="button"
							className={`pauseButton standard imageButton ${props.isPaused ? 'active' : ''}`}
							title={pauseTitle}
							disabled={!props.isConnected || !props.hasGameStarted}
							onClick={() => props.onPause()}
						>
							<img src={pauseImg} />
						</button>
					) : null}

					<div className="gameMenuHost" style={gameMenuHostStyle}>
						<FlyoutButton
							className="gameMenuButton standard"
							title={localization.menu}
							flyout={(
								<ul className="gameMenu">
									{props.role === Role.Showman
										? (
											<>
												<li
													className={`${enabledClass} ${props.areSumsEditable ? 'active' : ''}`}
													onClick={() => props.onEditSums(!props.areSumsEditable)}
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
									<li onClick={() => props.onShowTables()}>{localization.tables}</li>
									<li onClick={() => props.onShowBanned()}>{localization.bannedList}</li>
									<li onClick={() => props.onShowGameInfo()}>{localization.gameInfo}</li>
									{canPause ? <li className={enabledClass} onClick={() => props.onPause()}>{pauseTitle}</li> : null}

									{props.role === Role.Showman ? (<>
										<li className={enabledEditClass} onClick={() => props.onEditTable()}>{localization.editTable}</li>
										<li className={enabledClass} onClick={() => props.onGiveTurn()}>{localization.giveTurn}</li>
										</>) : null}

									{voiceChatUri && isWellFormedUri(voiceChatUri) ? (
										<li title={voiceChatUri} onClick={() => window.open(voiceChatUri, '_blank')}>{localization.voiceChat}</li>
									) : null}

									<li onClick={() => props.onShowSettings()}>{localization.settings}</li>
								</ul>
							)}
							theme={FlyoutTheme.Dark}
							alignWidth
							verticalOrientation={FlyoutVerticalOrientation.Top}
						>
							<span>…</span>
						</FlyoutButton>
					</div>

					{props.isHost ? (
						<button
							type="button"
							className={`nextButton standard imageButton ${canStart ? 'startButton' : ''}`}
							title={canStart ? localization.startGameHint : localization.next}
							onClick={canStart ? props.onStart : props.onMoveNext}>
							{canStart ? <span role="img" aria-label="arrow right">▶</span> : <img src={nextImg} />}
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
										<li className={enabledClass} onClick={() => props.onExit()}>{localization.exitFromGame}</li>
									</ul>
								</div>
							</div>
						)}
						theme={FlyoutTheme.Dark}
						alignWidth
						verticalOrientation={FlyoutVerticalOrientation.Top}
						horizontalOrientation={FlyoutHorizontalOrientation.Left}
					>
						<img src={exitImg} />
					</FlyoutButton>
				</div>
			</div>

			{props.lastReplic && props.lastReplic.text.length > 0 ? (
				<div id="lastReplic">
					<span>
						{props.lastReplic.sender ? (
							<span>
								<b>{props.lastReplic.sender}</b>
								<span>: </span>
							</span>
						) : null}
						{props.lastReplic.text}
					</span>
				</div>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideControlPanel);
