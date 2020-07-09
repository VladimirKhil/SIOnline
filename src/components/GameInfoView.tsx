import * as React from 'react';
import localization from '../model/resources/localization';
import Role from '../model/enums/Role';
import { connect } from 'react-redux';
import State from '../state/State';
import actionCreators from '../state/actionCreators';
import GameInfo from '../model/server/GameInfo';
import GameType from '../model/enums/GameType';
import ProgressBar from './common/ProgressBar';

import './GameInfoView.css';

interface GameInfoViewOwnProps {
	isConnected: boolean;
	onPasswordChanged: (password: string) => void;
	onJoin: (gameId: number, role: Role) => void;
}

interface GameInfoViewStateProps {
	password: string;
	joinGameProgress: boolean;
	joinGameError: string | null;
}

interface GameInfoViewProps extends GameInfoViewOwnProps, GameInfoViewStateProps {
	game?: GameInfo;
	showGameName: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	password: state.online.password,
	joinGameProgress: state.online.joinGameProgress,
	joinGameError: state.online.joingGameError
});

const mapDispatchToProps = (dispatch: any) => ({
	onPasswordChanged: (newPassword: string) => {
		dispatch(actionCreators.passwordChanged(newPassword));
	},
	onJoin: (gameId: number, role: Role) => {
		dispatch(actionCreators.joinGame(gameId, role));
	}
});

const buildStage = (stage: number, stageName: string) => {
	switch (stage) {
		case 0:
			return localization.created;
		case 1:
			return localization.started;
		case 2:
			return `${localization.round}: ${stageName}`;
		case 3:
			return localization.final;
		default:
			return localization.gameFinished;
	}
};

const buildRules = (rules: number, isSimple: boolean) => {
	let result = '';
	if (isSimple) {
		if (result.length > 0) {
			result += ', ';
		}

		result += localization.sport;
	}

	if ((rules & 1) === 0) {
		if (result.length > 0) {
			result += ', ';
		}

		result += localization.nofalsestart;
	}

	if ((rules & 2) > 0) {
		if (result.length > 0) {
			result += ', ';
		}

		result += localization.oral;
	}

	if ((rules & 4) > 0) {
		if (result.length > 0) {
			result += ', ';
		}

		result += localization.errorTolerant;
	}

	return result;
};

// tslint:disable-next-line: function-name
export function GameInfoView(props: GameInfoViewProps) {
	if (!props.game) {
		return (
			<section className="gameinfoHost">
				<header></header>
				<div id="gameinfo"></div>
			</section>
		);
	}

	const createdTime = new Date(props.game.startTime).toLocaleString();

	const realStart = new Date(props.game.realStartTime);
	const startedTime =  realStart.getFullYear() !== 1 ? realStart.toLocaleString() : '';

	const free = [true, false, false];

	let showman: string = '';
	let players: string = '';
	let viewers: string = '';

	const persons = props.game.persons;
	for (let i = 0; i < persons.length; i++) {
		const person = persons[i];
		if (!person.isOnline) {
			free[person.role] = true;
		} else {
			if (person.role === Role.Showman) {
				showman = person.name;
			} else if (person.role === Role.Player) {
				if (players.length > 0) {
					players += ', ';
				}

				players += person.name;
			} else {
				if (viewers.length > 0) {
					viewers += ', ';
				}

				viewers += person.name;
			}
		}
	}

	const canJoinAsPlayer = free[Role.Player];
	const canJoinAsShowman = free[Role.Showman];

	const game = props.game;

	return (
		<section className="gameinfoHost">
			<header></header>
			<div id="gameinfo">
				{game ? (
					<div id="innerinfo">
						{props.showGameName ? <h1 id="gameName">{game.gameName}</h1> : null}
						<div className="maininfo">
							<dl>
								<dt>{localization.host}</dt>
								<dd>{game.owner}</dd>
								<dt>{localization.questionPackage}</dt>
								<dd>{game.packageName}</dd>
								<dt>{localization.rules}</dt>
								<dd>{buildRules(game.rules, game.mode === GameType.Simple)}</dd>
								<dt>{localization.created}</dt>
								<dd>{createdTime}</dd>
								<dt>{localization.started}</dt>
								<dd>{startedTime}</dd>
								<dt>{localization.status}</dt>
								<dd>{buildStage(game.stage, game.stageName)}</dd>
								<dt>{localization.showman}</dt>
								<dd>{showman}</dd>
								<dt>{localization.players}</dt>
								<dd>{players}</dd>
								<dt>{localization.viewers}</dt>
								<dd>{viewers}</dd>
							</dl>
						</div>
						{game.passwordRequired ? (<div className="passwordInfo">
							<span>{localization.password}</span>
							<input id="password" type="password" disabled={props.joinGameProgress} value={props.password}
								onChange={e => props.onPasswordChanged(e.target.value)} />
						</div>) : null}
						<div className="joinGameError">{props.joinGameError}</div>
						<div className="actions">
							<div id="actionsHost">
								<button className="join" onClick={() => props.onJoin(game.gameID, Role.Showman)}
									disabled={!props.isConnected || props.joinGameProgress || game.passwordRequired && !props.password || !canJoinAsShowman}>
										{localization.joinAsShowman}
								</button>
								<button className="join" onClick={() => props.onJoin(game.gameID, Role.Player)}
									disabled={!props.isConnected || props.joinGameProgress || game.passwordRequired && !props.password || !canJoinAsPlayer}>
										{localization.joinAsPlayer}
								</button>
								<button className="join" onClick={() => props.onJoin(game.gameID, Role.Viewer)}
									disabled={!props.isConnected || props.joinGameProgress || game.passwordRequired && !props.password}>
										{localization.joinAsViewer}
								</button>
							</div>
						</div>
					</div>
				) : null}
				{props.joinGameProgress ? <div className="joinGameProgress"><ProgressBar isIndeterminate={true} /></div> : null}
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameInfoView);
