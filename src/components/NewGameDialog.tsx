import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import localization from '../model/resources/localization';
import Dialog from './common/Dialog';
import ProgressBar from './common/ProgressBar';
import State from '../state/State';
import Role from '../model/enums/Role';
import GameType from '../model/enums/GameType';
import Constants from '../model/enums/Constants';

import './NewGameDialog.css';

interface NewGameDialogProps {
	isConnected: boolean;
	gameName: string;
	gameType: GameType;
	gameRole: Role;
	playersCount: number;
	inProgress: boolean;
	error: string | null;
	onGameNameChanged: (newGameName: string) => void;
	onGameTypeChanged: (newGameType: number) => void;
	onGameRoleChanged: (newGameRole: Role) => void;
	onPlayersCountChanged: (gamePlayersCount: number) => void;
	onCreate: () => void;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	gameName: state.game.name,
	gameType: state.game.type,
	gameRole: state.game.role,
	playersCount: state.game.playersCount,
	inProgress: state.online.gameCreationProgress,
	error: state.online.gameCreationError
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onGameNameChanged: (newGameName: string) => {
		dispatch(actionCreators.gameNameChanged(newGameName));
	},
	onGameTypeChanged: (newGameType: number) => {
		dispatch(actionCreators.gameTypeChanged(newGameType));
	},
	onGameRoleChanged: (newGameRole: Role) => {
		dispatch(actionCreators.gameRoleChanged(newGameRole));
	},
	onPlayersCountChanged: (playersCount: number) => {
		dispatch(actionCreators.playersCountChanged(playersCount));
	},
	onCreate: () => {
		dispatch((actionCreators.createNewGame() as object) as Action);
	},
	onClose: () => {
		dispatch(actionCreators.newGameCancel());
	}
});

export class NewGameDialog extends React.Component<NewGameDialogProps> {
	constructor(props: NewGameDialogProps) {
		super(props);
	}

	private onGameNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onGameNameChanged(e.target.value);
	}

	private onGameNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.charCode === Constants.KEY_ENTER) {
			this.props.onCreate();
		}
	}

	private onGameTypeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onGameTypeChanged(parseInt(e.target.value, 10));
	}

	private onGameRoleChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onGameRoleChanged(parseInt(e.target.value, 10));
	}

	private onPlayersCountChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onPlayersCountChanged(parseInt(e.target.value, 10));
	}

	render() {
		return (
			<Dialog id="newGameDialog" title={localization.newGame} onClose={this.props.onClose}>
				<div className="settings">
					<p>{localization.gameName}</p>
					<input type="text" value={this.props.gameName} onChange={this.onGameNameChanged} onKeyPress={this.onGameNameKeyPress} />
					<p>{localization.gameType}</p>
					<select value={this.props.gameType} onChange={this.onGameTypeChanged}>
						<option value="1">{localization.sport}</option>
						<option value="0">{localization.tv}</option>
					</select>
					<p>{localization.role}</p>
					<select value={this.props.gameRole} onChange={this.onGameRoleChanged}>
						<option value="0">{localization.viewer}</option>
						<option value="1">{localization.player}</option>
						<option value="2">{localization.showman}</option>
					</select>
					<p>{localization.playersCount}</p>
					<select value={this.props.playersCount} onChange={this.onPlayersCountChanged}>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
						<option value="10">10</option>
						<option value="11">11</option>
						<option value="12">12</option>
					</select>
				</div>
				<span className="gameCreationError">{this.props.error}</span>
				<button className="startGame" disabled={!this.props.isConnected || this.props.inProgress}
					onClick={this.props.onCreate}>{localization.startGame}</button>
				{this.props.inProgress ? <ProgressBar /> : null}
			</Dialog>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(NewGameDialog);
