import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../../state/State';
import PersonsView from '../PersonsView';
import GameLogView from '../GameLogView';
import ChatMode from '../../../model/enums/ChatMode';
import roomActionCreators from '../../../state/room/roomActionCreators';
import localization from '../../../model/resources/localization';
import ChatInput from '../ChatInput/ChatInput';
import Role from '../../../model/Role';
import TablesView from '../TablesView';
import { isHost } from '../../../utils/StateHelpers';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton';
import GameMetadataView from '../GameMetadataView';
import BannedView from '../BannedView';
import isWellFormedUri from '../../../utils/isWellFormedUri';
import { useAppDispatch } from '../../../state/new/hooks';
import { selectPlayers } from '../../../state/new/room2Slice';

import './GameChatView.css';
import sumsImg from '../../../../assets/images/sums.png';
import editImg from '../../../../assets/images/edit.png';
import moveRoundImg from '../../../../assets/images/move_round.png';
import activePlayerImg from '../../../../assets/images/active_player.png';

interface GameChatViewProps {
	isConnected: boolean;
	chatMode: ChatMode;
	personsCount: number;
	role: Role;
	areSumsEditable: boolean;
	roundsNames: string[] | null;
	roundIndex: number;
	isHost: boolean;
	isPaused: boolean;
	isEditEnabled: boolean;
	voiceChatUri: string | null;

	onChatModeChanged: (chatMode: ChatMode) => void;
	onEditSums: (enable: boolean) => void;
	navigateToRound: (roundIndex: number) => void;
	onEditTable: () => void;
	onGiveTurn: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	chatMode: state.room.chat.mode,
	personsCount: Object.values(state.room.persons.all).length,
	role: state.room.role,
	areSumsEditable: state.room.areSumsEditable,
	roundsNames: state.room.roundsNames,
	roundIndex: state.room.stage.roundIndex,
	isHost: isHost(state),
	isPaused: state.room.stage.isGamePaused,
	isEditEnabled: state.room.stage.isEditEnabled,
	voiceChatUri: state.room.metadata.voiceChatUri,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: ChatMode) => {
		dispatch(roomActionCreators.runChatModeChanged(chatMode));
	},
	onEditSums: (enable: boolean) => {
		dispatch(roomActionCreators.areSumsEditableChanged(enable) as unknown as Action);
	},
	navigateToRound: (roundIndex: number) => {
		dispatch(roomActionCreators.navigateToRound(roundIndex) as unknown as Action);
	},
	onEditTable: () => {
		dispatch(roomActionCreators.editTable());
	},
	onGiveTurn: () => {
		dispatch(roomActionCreators.giveTurn() as unknown as Action);
	},
});

function getSideArea(props: GameChatViewProps): React.ReactNode {
	switch (props.chatMode) {
		case ChatMode.Chat:
			return (
				<div className="game__chat">
					<GameLogView />
					<ChatInput />

					{props.voiceChatUri && isWellFormedUri(props.voiceChatUri) ? (
						<a href={props.voiceChatUri} className='voiceChatUrl' target='_blank' rel='noopener noreferrer' title={props.voiceChatUri}>
							<button type='button' className="standard wide commandButton bottomButton">{localization.voiceChat}</button>
						</a>
					) : null}
				</div>
			);

		case ChatMode.Users:
			return (
				<div className="game__persons">
					<PersonsView />
				</div>
			);

		case ChatMode.Tables:
			return (
				<div className="game__persons">
					<TablesView />
				</div>
			);

		case ChatMode.Banned:
			return (
				<div className="tabBody">
					<BannedView />
				</div>
			);

		case ChatMode.Info:
		default:
			return (
				<div className="tabBody">
					<GameMetadataView />
				</div>
			);
	}
}

export function GameChatView(props: GameChatViewProps): JSX.Element {
	const appDispatch = useAppDispatch();

	const onGiveTurn = () =>{
		props.onGiveTurn();
		appDispatch(selectPlayers([]));
	};

	return (
		<div id="gameLogHost">
			<div className="wide tabHeader gameHeader">
				<h1
					className={props.chatMode === ChatMode.Chat ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Chat)}
					title={localization.chat}
				>
					💬
				</h1>

				<h1
					className={props.chatMode === ChatMode.Users ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Users)}
					title={localization.members}
				>
					<div>
						<span>👤{props.personsCount}</span>
					</div>
				</h1>

				{props.isHost ? (
					<h1
						className={props.chatMode === ChatMode.Tables ? 'activeTab' : ''}
						onClick={() => props.onChatModeChanged(ChatMode.Tables)}
						title={localization.tables}
					>
						🎓
					</h1>
				) : null}

				<h1
					className={props.chatMode === ChatMode.Banned ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Banned)}
					title={localization.bannedList}
				>
					🚫
				</h1>

				<h1
					className={props.chatMode === ChatMode.Info ? 'activeTab' : ''}
					onClick={() => props.onChatModeChanged(ChatMode.Info)}
					title={localization.gameInfo}
				>
					ℹ
				</h1>
			</div>

			<div className="sideArea">
				{getSideArea(props)}
			</div>

			{props.role === Role.Showman ? (
				<div className="sideButtonHost">
					<FlyoutButton
						className="standard imageButton wide commandButton bottomButton"
						disabled={!props.isConnected || !props.roundsNames || props.roundsNames.length < 2}
						flyout={
							<ul>
								{props.roundsNames?.map((name, index) => (
									<li
										key={index}
										className={index === props.roundIndex ? 'sideButtonActiveRound' : ''}
										onClick={() => props.navigateToRound(index)}
									>
										{name}
									</li>))}
							</ul>
						}
						horizontalOrientation={FlyoutHorizontalOrientation.Left}
						verticalOrientation={FlyoutVerticalOrientation.Top}
						alignWidth
						title={localization.gameManageHint}
					>
						<img src={moveRoundImg} />
					</FlyoutButton>

					<button
						type="button"
						className={`standard imageButton wide commandButton bottomButton ${props.isEditEnabled ? 'active' : ''}`}
						disabled={!props.isConnected || !props.isPaused}
						onClick={() => props.onEditTable()}
						title={localization.editTable}
					>
						<img src={editImg} />
					</button>

					<button
						type="button"
						className={`sumsButton standard imageButton wide commandButton bottomButton ${props.areSumsEditable ? 'active' : ''}`}
						disabled={!props.isConnected}
						onClick={onGiveTurn}
						title={localization.giveTurn}
					>
						<img src={activePlayerImg} />
					</button>

					<button
						type="button"
						className={`sumsButton standard imageButton wide commandButton bottomButton ${props.areSumsEditable ? 'active' : ''}`}
						disabled={!props.isConnected}
						onClick={() => props.onEditSums(!props.areSumsEditable)}
						title={localization.changeSums}
					>
						<img src={sumsImg} />
					</button>
				</div>) : null}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameChatView);
