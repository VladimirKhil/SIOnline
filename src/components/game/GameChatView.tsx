import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import PersonsView from './PersonsView';
import GameLogView from './GameLogView';
import ChatMode from '../../model/enums/ChatMode';
import runActionCreators from '../../state/run/runActionCreators';
import localization from '../../model/resources/localization';
import ChatInput from './ChatInput';
import Role from '../../client/contracts/Role';
import RoundProgress from './RoundProgress';
import TablesView from './TablesView';
import isHost from '../../utils/StateHelpers';

import './GameChatView.css';

interface GameChatViewProps {
	isConnected: boolean;
	chatMode: ChatMode;
	personsCount: number;
	role: Role;
	areSumsEditable: boolean;
	isHost: boolean;
	onChatModeChanged: (chatMode: ChatMode) => void;
	onMarkQuestion: () => void;
	onEditSums: (enable: boolean) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	chatMode: state.run.chat.mode,
	personsCount: Object.values(state.run.persons.all).length,
	role: state.run.role,
	areSumsEditable: state.run.areSumsEditable,
	isHost: isHost(state)
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: ChatMode) => {
		dispatch(runActionCreators.runChatModeChanged(chatMode));
	},
	onMarkQuestion: () => {
		dispatch(runActionCreators.markQuestion() as unknown as Action);
	},
	onEditSums: (enable: boolean) => {
		dispatch(runActionCreators.areSumsEditableChanged(enable) as unknown as Action);
	}
});

function getSideArea(props: GameChatViewProps): React.ReactNode {
	switch (props.chatMode) {
		case ChatMode.Chat:
			return (
				<div className="game__chat">
					<GameLogView />
					<ChatInput />
				</div>
			);

		case ChatMode.Users:
			return (
				<div className="game__persons">
					<PersonsView />
				</div>
			);

		default:
			return (
				<div className="game__persons">
					<TablesView />
				</div>
			);
	}
}

export function GameChatView(props: GameChatViewProps): JSX.Element {
	return (
		<div id="gameLogHost">
			<div className="wide tabHeader gameHeader">
				<h1
					className={props.chatMode === ChatMode.Chat ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Chat)}
				>
					{localization.chat}
				</h1>
				<h1
					className={props.chatMode === ChatMode.Users ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Users)}
				>
					<span>{localization.members}</span>
					<span> (</span>
					<span>{props.personsCount}</span>
					<span>)</span>
				</h1>
				{props.isHost ? (
					<h1
						className={props.chatMode === ChatMode.Tables ? 'activeTab' : ''}
						onClick={() => props.onChatModeChanged(ChatMode.Tables)}
					>
						{localization.tables}
					</h1>
				) : null}
			</div>
			<div className="sideArea">
				{getSideArea(props)}
			</div>
			<div className="sideButtonHost">
				{props.role === Role.Showman ? (
					<button
						type="button"
						className={`standard wide commandButton bottomButton ${props.areSumsEditable ? 'active' : ''}`}
						disabled={!props.isConnected}
						onClick={() => props.onEditSums(!props.areSumsEditable)}
					>
						{localization.changeSums}
					</button>
				) : null}
				<button
					type="button"
					className="standard wide commandButton bottomButton"
					disabled={!props.isConnected}
					onClick={() => props.onMarkQuestion()}
					title={localization.complainHint}
				>
					{localization.complain}
				</button>
			</div>
			<RoundProgress />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameChatView);
