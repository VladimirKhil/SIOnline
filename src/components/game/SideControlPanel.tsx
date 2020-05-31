import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import runActionCreators from '../../state/run/runActionCreators';
import localization from '../../model/resources/localization';
import FlyoutButton, { FlyoutVerticalOrientation, FlyoutTheme } from '../common/FlyoutButton';
import Role from '../../model/enums/Role';
import ChatMessage from '../../model/ChatMessage';
import GameButton from './GameButton';
import ChatInput from './ChatInput';
import AnswerInput from './AnswerInput';
import StakeSumEditor from './stakes/StakeSumEditor';
import SendPassButton from './stakes/SendPassButton';
import SendStakeButton from './stakes/SendStakeButton';
import SendAllInButton from './stakes/SendAllInButton';

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
	onChatVisibilityChanged: (isOpen: boolean) => void;
	onMarkQuestion: () => void;
	onShowPersons: () => void;
	onPause: () => void;
	onExit: () => void;
	onEditSums: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	role: state.run.role,
	isChatVisible: state.run.chat.isVisible,
	isChatActive: state.run.chat.isActive,
	isHost: state.game.isHost,
	isPaused: state.run.stage.isGamePaused,
	lastReplic: state.run.lastReplic,
	areStakesVisible: state.run.stakes.areVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatVisibilityChanged: (isOpen: boolean) => {
		dispatch(runActionCreators.runChatVisibilityChanged(isOpen));
	},
	onMarkQuestion: () => {
		dispatch((runActionCreators.markQuestion() as object) as Action);
	},
	onShowPersons: () => {
		dispatch(runActionCreators.runShowPersons());
	},
	onPause: () => {
		dispatch((runActionCreators.pause() as object) as Action);
	},
	onExit: () => {
		dispatch((runActionCreators.exitGame() as object) as Action);
	},
	onEditSums: () => {
		dispatch((runActionCreators.areSumsEditableChanged(true) as object) as Action);
	}
});

// tslint:disable-next-line: function-name
export function SideControlPanel(props: SideControlPanelProps) {
	const chatButtonStyle: React.CSSProperties = {
		backgroundColor: props.isChatActive ? 'lightyellow' : 'transparent'
	};

	const pauseTitle = props.isPaused ? localization.resume : localization.pause;

	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<div className="game__utilsArea">
			{props.role === Role.Player ?
				(<div className="playerButtonWrapper">
					<div id="playerButtonHost">
						<GameButton />
						{props.areStakesVisible ? <StakeSumEditor type="number" className="stakeSum checkSum" /> : null}
					</div>
				</div>) : null
			}

			<div id="gameMessageHost">
				<div id="messageWrapper">
					<ChatInput />
					<AnswerInput id="answerBox" />
					<button id="showChat" onClick={() => props.onChatVisibilityChanged(!props.isChatVisible)}
						style={chatButtonStyle}
						title={localization.showChat}><span>{props.isChatVisible ? '▼' : '▲'}</span></button>
					{props.areStakesVisible ? (
						<div className="stakeRangeHost">
							<StakeSumEditor type="range" className="stakeRange" />
						</div>
					) : null}
				</div>

				<div id="buttons">
					{props.isHost ? <button id="pauseButton" disabled={!props.isConnected} onClick={() => props.onPause()}>{pauseTitle}</button> : null}
					<div id="gameMenuHost">
						<FlyoutButton className="gameMenuButton" title={localization.menu} flyout={
							<ul className="gameMenu">
								{props.role === Role.Showman ?
									<li className={enabledClass} onClick={() => props.onEditSums()}>{localization.changeSums}</li>
									: null
								}
								<li className={enabledClass} onClick={() => props.onMarkQuestion()} title={localization.complainHint}>{localization.complain}</li>
								<li onClick={() => props.onShowPersons()}>{localization.members}</li>
								{props.isHost ? <li className={enabledClass} onClick={() => props.onPause()}>{pauseTitle}</li> : null}
							</ul>
						} theme={FlyoutTheme.Light} alignWidth={true} verticalOrientation={FlyoutVerticalOrientation.Top}>…</FlyoutButton>
					</div>
					<FlyoutButton className="exit" title={localization.menu} flyout={
							<div id="exitMenu" className="exitMenu">
								<div id="exitMenuPopup" className="gameMenuPopup">
									<p>{localization.exitConfirmation}</p>
									<ul>
										<li className={enabledClass} onClick={() => props.onExit()}>{localization.exitFromGame}</li>
									</ul>
								</div>
							</div>
						} theme={FlyoutTheme.Light} alignWidth={true}
						verticalOrientation={FlyoutVerticalOrientation.Top}>{localization.exit}</FlyoutButton>
				</div>
			</div>

			{props.lastReplic && props.lastReplic.text.length > 0 ? (
				<div id="lastReplic">
					<span>{props.lastReplic.sender ? (<span><b>{props.lastReplic.sender}</b>: </span>) : null}{props.lastReplic.text}</span>
				</div>)
				: null
			}

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
