import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import Role from '../client/contracts/Role';
import State from '../state/State';
import actionCreators from '../state/actionCreators';
import GameInfo from '../client/contracts/GameInfo';
import GameType from '../client/contracts/GameType';
import ProgressBar from './common/ProgressBar';

import './GameInfoView.css';

interface GameInfoViewOwnProps {
	isConnected: boolean;
	culture: string | null;
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
	culture: state.settings.appSettings.culture,
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

const buildRules = (rules: number, isSimple: boolean): string[] => {
	const result : string[] = [];
	if (isSimple) {
		result.push(localization.sport.toLowerCase());
	} else {
		result.push(localization.tv.toLowerCase());
	}

	if ((rules & 1) === 0) {
		result.push(localization.nofalsestart);
	}

	if ((rules & 2) > 0) {
		result.push(localization.oral);
	}

	if ((rules & 4) > 0) {
		result.push(localization.errorTolerant);
	}

	return result;
};

export function GameInfoView(props: GameInfoViewProps): JSX.Element {
	if (!props.game) {
		return (
			<section className="gameinfoHost">
				<div id="gameinfo" />
			</section>
		);
	}

	const language = localization.getLanguage();
	const createdTime = new Date(props.game.startTime).toLocaleString(language);

	const realStart = new Date(props.game.realStartTime);
	const startedTime = realStart.getFullYear() !== 1 ? realStart.toLocaleString(language) : '';

	const free = [true, false, false];

	let showman = '';
	const players : string[] = [];
	const viewers : string[] = [];

	const { persons } = props.game;
	for (let i = 0; i < persons.length; i++) {
		const person = persons[i];
		if (!person.isOnline) {
			free[person.role] = true;
		} else if (person.role === Role.Showman) {
			showman = person.name;
		} else if (person.role === Role.Player) {
			players.push(person.name);
		} else {
			viewers.push(person.name);
		}
	}

	const canJoinAsPlayer = free[Role.Player];
	const canJoinAsShowman = free[Role.Showman];

	const { game } = props;

	const rules = buildRules(game.rules, game.mode === GameType.Simple);

	return (
		<section className="gameinfoHost">
			<div id="gameinfo">
				{game ? (
					<div id="innerinfo">
						{props.showGameName ? <h1 id="gameName" title={game.gameName}>{game.gameName}</h1> : null}
						<div className="maininfo">
							<dl>
								<dt>{localization.host}</dt>
								<dd>{game.owner}</dd>
								<dt>{localization.questionPackage}</dt>
								<dd>{game.packageName}</dd>
								<dt>{localization.rules}</dt>
								<dd>{rules.map(name => <div className='personName' key={name}>{name}</div>)}</dd>
								<dt>{localization.showman}</dt>
								<dd><div className='personName'>{showman ?? ' '}</div></dd>
								<dt>{localization.players}</dt>
								<dd>{players.map(name => <div className='personName' key={name}>{name}</div>)}</dd>
								<dt>{localization.viewers}</dt>
								<dd>{viewers.map(name => <div className='personName' key={name}>{name}</div>)}</dd>
								<dt>{localization.status}</dt>
								<dd>{buildStage(game.stage, game.stageName)}</dd>
								<dt>{localization.created}</dt>
								<dd>{createdTime}</dd>
								<dt>{localization.started}</dt>
								<dd>{startedTime}</dd>
							</dl>
						</div>
						{game.passwordRequired ? (
							<div className="passwordInfo">
								<span>{localization.password}</span>
								<input
									id="password"
									type="password"
									disabled={props.joinGameProgress}
									value={props.password}
									onChange={e => props.onPasswordChanged(e.target.value)}
								/>
							</div>
						) : null}
						<div className="joinGameError">{props.joinGameError}</div>
						<div className="actions">
							<div id="actionsHost">
								<button
									type="button"
									className="join standard"
									onClick={() => props.onJoin(game.gameID, Role.Showman)}
									disabled={!props.isConnected ||
										props.joinGameProgress ||
										(game.passwordRequired && !props.password) ||
										!canJoinAsShowman}
								>
									{localization.joinAsShowman}
								</button>
								<button
									type="button"
									className="join standard"
									onClick={() => props.onJoin(game.gameID, Role.Player)}
									disabled={!props.isConnected ||
										props.joinGameProgress ||
										(game.passwordRequired && !props.password) ||
										!canJoinAsPlayer}
								>
									{localization.joinAsPlayer}
								</button>
								<button
									type="button"
									className="join standard"
									onClick={() => props.onJoin(game.gameID, Role.Viewer)}
									disabled={!props.isConnected || props.joinGameProgress || (game.passwordRequired && !props.password)}
								>
									{localization.joinAsViewer}
								</button>
							</div>
						</div>
					</div>
				) : null}
				{props.joinGameProgress ? <div className="joinGameProgress"><ProgressBar isIndeterminate /></div> : null}
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameInfoView);
