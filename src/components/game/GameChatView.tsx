import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import PersonsView from './PersonsView';
import GameLogView from './GameLogView';
import ChatMode from '../../model/enums/ChatMode';
import runActionCreators from '../../state/run/runActionCreators';
import localization from '../../model/resources/localization';
import ChatInput from './ChatInput';
import Role from '../../model/enums/Role';
import RoundProgress from './RoundProgress';

import './GameChatView.css';

interface GameChatViewProps {
	isConnected: boolean;
	chatMode: ChatMode;
	personsCount: number;
	role: Role;
	areSumsEditable: boolean;
	onChatModeChanged: (chatMode: ChatMode) => void;
	onMarkQuestion: () => void;
	onEditSums: (enable: boolean) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	chatMode: state.run.chat.mode,
	personsCount: Object.values(state.run.persons.all).length,
	role: state.run.role,
	areSumsEditable: state.run.areSumsEditable
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: ChatMode) => {
		dispatch(runActionCreators.runChatModeChanged(chatMode));
	},
	onMarkQuestion: () => {
		dispatch((runActionCreators.markQuestion() as object) as Action);
	},
	onEditSums: (enable: boolean) => {
		dispatch((runActionCreators.areSumsEditableChanged(enable) as object) as Action);
	}
});

// tslint:disable-next-line: function-name
export function GameChatView(props: GameChatViewProps) {
	return (
		<div id="gameLogHost">
			<div className="wide tabHeader gameHeader">
				<h1 className={props.chatMode === ChatMode.Chat ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Chat)}>{localization.chat}</h1>
				<h1 className={props.chatMode === ChatMode.Users ? 'activeTab' : ''} onClick={() => props.onChatModeChanged(ChatMode.Users)}>
					<span>{localization.members}</span><span> (</span><span>{props.personsCount}</span><span>)</span>
				</h1>
			</div>
			<div className="sideArea">
				{props.chatMode === ChatMode.Chat ? (
					<div className="game__chat">
						<GameLogView />
						<ChatInput />
					</div>
				) : (
					<div className="game__persons">
						<PersonsView />
					</div>
				)}
			</div>
			<div className="sideButtonHost">
				{props.role === Role.Showman ? (
					<button className={`wide commandButton bottomButton ${props.areSumsEditable ? 'active' : ''}`} disabled={!props.isConnected}
						onClick={() => props.onEditSums(!props.areSumsEditable)}>{localization.changeSums}</button>
					) : null}
				<button className="wide commandButton bottomButton" disabled={!props.isConnected}
					onClick={() => props.onMarkQuestion()} title={localization.complainHint}>{localization.complain}</button>
			</div>
			<RoundProgress />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameChatView);
