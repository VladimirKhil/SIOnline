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
import UserOptions from '../../panels/UserOptions/UserOptions';

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
		<div id="gameLogHost" className='gameSideView'>
			<header>
				<h1>
					<div className='right'>
						<button
							className={props.chatMode === ChatMode.Chat ? 'activeTab' : ''}
							onClick={() => props.onChatModeChanged(ChatMode.Chat)}
							title={localization.chat}>
							<svg width="22" height="20" viewBox="0 0 22 20" fill="none">
								<path d="M11.0193 0C4.93282 0 0.00107629 4.15625 0.00107629 9.28571C0.00107629 11.5013 0.920078 13.5259 2.45333 15.1205C1.91527 17.3692 0.117297 19.3737 0.0957744 19.396C-0.00107594 19.4964 -0.0279788 19.652 0.0312075 19.7859C0.0850907 19.9196 0.204367 20 0.344262 20C3.19597 20 5.2987 18.5821 6.39633 17.7058C7.79959 18.2545 9.36641 18.5714 11.0193 18.5714C17.1058 18.5714 22 14.4138 22 9.28571C22 4.15759 17.1058 0 11.0193 0Z" fill="white"/>
							</svg>
						</button>

						<button
							className={props.chatMode === ChatMode.Users || props.chatMode === ChatMode.Tables || props.chatMode === ChatMode.Banned ? 'activeTab' : ''}
							onClick={() => props.onChatModeChanged(ChatMode.Users)}
							title={localization.members}>
							<svg width="24" height="18" viewBox="0 0 24 18" fill="none">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 18C10.5 18 9 18 9 16.5C9 15 10.5 10.5 16.5 10.5C22.5 10.5 24 15 24 16.5C24 18 22.5 18 22.5 18H10.5ZM16.5 9C17.6935 9 18.8381 8.52589 19.682 7.68198C20.5259 6.83807 21 5.69347 21 4.5C21 3.30653 20.5259 2.16193 19.682 1.31802C18.8381 0.474106 17.6935 0 16.5 0C15.3065 0 14.1619 0.474106 13.318 1.31802C12.4741 2.16193 12 3.30653 12 4.5C12 5.69347 12.4741 6.83807 13.318 7.68198C14.1619 8.52589 15.3065 9 16.5 9ZM7.824 18C7.60163 17.5317 7.49073 17.0183 7.5 16.5C7.5 14.4675 8.52 12.375 10.404 10.92C9.46364 10.6302 8.48392 10.4885 7.5 10.5C1.5 10.5 0 15 0 16.5C0 18 1.5 18 1.5 18H7.824ZM9.40165 7.90165C8.69839 8.60491 7.74456 9 6.75 9C5.75544 9 4.80161 8.60491 4.09835 7.90165C3.39509 7.19839 3 6.24456 3 5.25C3 4.25544 3.39509 3.30161 4.09835 2.59835C4.80161 1.89509 5.75544 1.5 6.75 1.5C7.74456 1.5 8.69839 1.89509 9.40165 2.59835C10.1049 3.30161 10.5 4.25544 10.5 5.25C10.5 6.24456 10.1049 7.19839 9.40165 7.90165Z" fill="white"/>
							</svg>
						</button>

						<button
							className={props.chatMode === ChatMode.Info ? 'activeTab' : ''}
							onClick={() => props.onChatModeChanged(ChatMode.Info)}
							title={localization.gameInfo}>
							ℹ
						</button>

						<UserOptions />
					</div>
				</h1>
			</header>

			{props.chatMode === ChatMode.Users || props.chatMode === ChatMode.Tables || props.chatMode === ChatMode.Banned ?
				<div className="wide tabHeader gameHeader">
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
				</div> : null}

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
