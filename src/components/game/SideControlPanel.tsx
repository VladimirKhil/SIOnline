import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import runActionCreators from '../../state/run/runActionCreators';
import localization from '../../model/resources/localization';
import FlyoutButton, { FlyoutVerticalOrientation, FlyoutTheme, FlyoutHorizontalOrientation } from '../common/FlyoutButton';
import Role from '../../client/contracts/Role';
import ChatMessage from '../../model/ChatMessage';
import GameButton from './GameButton';
import ChatInput from './ChatInput';
import AnswerInput from './AnswerInput';
import StakeSumEditor from './stakes/StakeSumEditor';
import SendPassButton from './stakes/SendPassButton';
import SendStakeButton from './stakes/SendStakeButton';
import SendAllInButton from './stakes/SendAllInButton';
import isHost from '../../utils/StateHelpers';

import './SideControlPanel.css';

interface SideControlPanelProps {
	isConnected: boolean;
	role: Role;
	isChatVisible: boolean;
	isChatActive: boolean;
	isHost: boolean;
	isPaused: boolean;
	lastReplic: ChatMessage | null;
	areStakesVisible: boolean;
	areSumsEditable: boolean;
	onChatVisibilityChanged: (isOpen: boolean) => void;
	onMarkQuestion: () => void;
	onShowPersons: () => void;
	onShowTables: () => void;
	onPause: () => void;
	onExit: () => void;
	onEditSums: (enable: boolean) => void;
	onMoveNext: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	role: state.run.role,
	isChatVisible: state.run.chat.isVisible,
	isChatActive: state.run.chat.isActive,
	isHost: isHost(state),
	isPaused: state.run.stage.isGamePaused,
	lastReplic: state.run.lastReplic,
	areStakesVisible: state.run.stakes.areVisible,
	areSumsEditable: state.run.areSumsEditable
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatVisibilityChanged: (isOpen: boolean) => {
		dispatch(runActionCreators.runChatVisibilityChanged(isOpen));
	},
	onMarkQuestion: () => {
		dispatch(runActionCreators.markQuestion() as unknown as Action);
	},
	onShowPersons: () => {
		dispatch(runActionCreators.runShowPersons());
	},
	onShowTables: () => {
		dispatch(runActionCreators.runShowTables());
	},
	onPause: () => {
		dispatch(runActionCreators.pause() as unknown as Action);
	},
	onExit: () => {
		dispatch(runActionCreators.exitGame() as unknown as Action);
	},
	onEditSums: (enable: boolean) => {
		dispatch(runActionCreators.areSumsEditableChanged(enable) as unknown as Action);
	},
	onMoveNext: () => {
		dispatch(runActionCreators.moveNext() as unknown as Action);
	}
});

export function SideControlPanel(props: SideControlPanelProps): JSX.Element {
	const chatButtonStyle: React.CSSProperties = {
		backgroundColor: props.isChatActive ? 'lightyellow' : 'transparent'
	};

	const gameMenuHostStyle: React.CSSProperties = {
		flex: props.isHost ? '2 0 0' : '1 0 0 '
	};

	const pauseTitle = props.isPaused ? localization.resume : localization.pause;
	const canPause = props.isHost || props.role === Role.Showman;

	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<div className="game__utilsArea">
			{props.role === Role.Player
				? (
					<div className="playerButtonWrapper">
						<div id="playerButtonHost">
							<GameButton />
							{props.areStakesVisible ? <StakeSumEditor type="number" className="stakeSum checkSum" /> : null}
						</div>
					</div>
				) : null}

			<div className="gameMessageHost">
				<div className="messageWrapper">
					<ChatInput />
					<AnswerInput id="answerBox" />
					<button
						type="button"
						id="showChat"
						onClick={() => props.onChatVisibilityChanged(!props.isChatVisible)}
						style={chatButtonStyle}
						title={localization.showChat}
					>
						<span>{props.isChatVisible ? '▼' : '▲'}</span>
					</button>
					{props.areStakesVisible ? (
						<div className="stakeRangeHost">
							<StakeSumEditor type="range" className="stakeRange" />
						</div>
					) : null}
				</div>

				<div className="sidecontrol_buttons">
					{canPause ? (
						<button type="button" id="pauseButton" disabled={!props.isConnected} onClick={() => props.onPause()}>
							{pauseTitle}
						</button>
					) : null}
					<div className="gameMenuHost" style={gameMenuHostStyle}>
						<FlyoutButton
							className="gameMenuButton"
							title={localization.menu}
							flyout={(
								<ul className="gameMenu">
									{props.role === Role.Showman
										? (
											<li
												className={`${enabledClass} ${props.areSumsEditable ? 'active' : ''}`}
												onClick={() => props.onEditSums(!props.areSumsEditable)}
											>
												{localization.changeSums}
											</li>
										) : null}
									<li className={enabledClass} onClick={() => props.onMarkQuestion()} title={localization.complainHint}>
										{localization.complain}
									</li>
									<li onClick={() => props.onShowPersons()}>{localization.members}</li>
									<li onClick={() => props.onShowTables()}>{localization.tables}</li>
									{canPause ? <li className={enabledClass} onClick={() => props.onPause()}>{pauseTitle}</li> : null}
								</ul>
							)}
							theme={FlyoutTheme.Light}
							alignWidth
							verticalOrientation={FlyoutVerticalOrientation.Top}
						>
							<span>…</span>
						</FlyoutButton>
					</div>
					{props.isHost ? (
						<button type="button" className="nextButton" title={localization.next} onClick={props.onMoveNext}>
							<span role="img" aria-label="arrow right">➡️</span>
						</button>
					) : null}
					<FlyoutButton
						className="exit"
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
						theme={FlyoutTheme.Light}
						alignWidth
						verticalOrientation={FlyoutVerticalOrientation.Top}
						horizontalOrientation={FlyoutHorizontalOrientation.Left}
					>
						<span role="img" aria-label="door">🚪</span>
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

			<div id="stakeButtonsHost">
				{props.areStakesVisible ? (
					<div id="stakeButtons">
						<SendPassButton />
						<SendStakeButton />
						<SendAllInButton />
					</div>
				) : null}
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideControlPanel);
