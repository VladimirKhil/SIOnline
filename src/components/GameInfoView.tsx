import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import Role from '../model/Role';
import ServerRole from '../client/contracts/ServerRole';
import State from '../state/State';
import onlineActionCreators from '../state/online/onlineActionCreators';
import GameInfo from '../client/contracts/GameInfo';
import ServerGameType from '../client/contracts/ServerGameType';
import ProgressBar from './common/ProgressBar';
import { getReadableTimeSpan } from '../utils/TimeHelpers';
import GameStage from '../client/contracts/GameStage';
import GameRules, { parseRulesFromString } from '../client/contracts/GameRules';
import { useNavigate } from 'react-router-dom';
import Path from '../model/enums/Path';

import './GameInfoView.css';

interface GameInfoViewOwnProps {
	isConnected: boolean;
	culture: string | null;
	onPasswordChanged: (password: string) => void;
	onJoin: (gameId: number, role: Role, callback: (gameId: number) => void) => void;
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
		dispatch(onlineActionCreators.passwordChanged(newPassword));
	},
	onJoin: (gameId: number, role: Role, callback: (gameId: number) => void) => {
		dispatch(onlineActionCreators.joinGame(gameId, role, callback));
	}
});

const buildStage = (stage: GameStage, stageName: string, progressCurrent: number, progressTotal: number) => {
	switch (stage) {

		case GameStage.Created:
			return localization.created;

		case GameStage.Started:
			return localization.started;

		case GameStage.Round:
			return `${progressCurrent}/${progressTotal}: ${localization.round}: ${stageName}`;

		case GameStage.Final:
			return localization.final;

		default:
			return localization.gameFinished;
	}
};

const buildRules = (rulesString: string, isSimple: boolean): string[] => {
	const rules = parseRulesFromString(rulesString);
	const result : string[] = [];

	if (isSimple) {
		result.push(localization.sport.toLowerCase());
	} else {
		result.push(localization.tv.toLowerCase());
	}

	if ((rules & GameRules.FalseStart) === 0) {
		result.push(localization.nofalsestart);
	}

	if ((rules & GameRules.Oral) > 0) {
		result.push(localization.oral);
	}

	if ((rules & GameRules.IgnoreWrong) > 0) {
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

	const navigate = useNavigate();
	const navigateToGame = (gameId: number) => navigate(Path.Room + '?gameId=' + gameId);

	const language = localization.getLanguage();
	const createdTime = new Date(props.game.StartTime).toLocaleString(language);

	const realStart = new Date(props.game.RealStartTime);
	const duration = realStart.getFullYear() !== 1 ? getReadableTimeSpan(Date.now() - realStart.getTime()) : '';

	const free = {
		[ServerRole.Viewer]: true,
		[ServerRole.Player]: false,
		[ServerRole.Showman]: false
	};

	let showman = '';
	const players : string[] = [];
	const viewers : string[] = [];

	const { Persons } = props.game;

	for (let i = 0; i < Persons.length; i++) {
		const person = Persons[i];

		if (!person.IsOnline) {
			free[person.Role] = true;
		} else if (person.Role === ServerRole.Showman) {
			showman = person.Name;
		} else if (person.Role === ServerRole.Player) {
			players.push(person.Name);
		} else {
			viewers.push(person.Name);
		}
	}

	const canJoinAsPlayer = free[ServerRole.Player];
	const canJoinAsShowman = free[ServerRole.Showman];

	const { game } = props;

	const rules = buildRules(game.Rules, game.Mode === ServerGameType.Simple);

	return (
		<section className="gameinfoHost">
			<div id="gameinfo">
				{game ? (
					<div id="innerinfo">
						{props.showGameName ? <h1 id="gameName" title={game.GameName}>{game.GameName}</h1> : null}

						<div className="maininfo">
							<dl>
								<dt>{localization.host}</dt>
								<dd>{game.Owner}</dd>
								<dt>{localization.questionPackage}</dt>
								<dd>{game.PackageName}</dd>
								<dt>{localization.rules}</dt>
								<dd>{rules.map(name => <div className='personName' key={name}>{name}</div>)}</dd>
								<dt>{localization.showman}</dt>
								<dd><div className='personName'>{showman ?? ' '}</div></dd>
								<dt>{localization.players}</dt>
								<dd>{players.map(name => <div className='personName' key={name}>{name}</div>)}</dd>
								<dt>{localization.viewers}</dt>
								<dd>{viewers.map(name => <div className='personName' key={name}>{name}</div>)}</dd>
								<dt>{localization.status}</dt>
								<dd>{buildStage(game.Stage, game.StageName, game.ProgressCurrent, game.ProgressTotal)}</dd>

								{duration.length > 0 ? (<>
									<dt>{localization.duration}</dt>
									<dd>{duration}</dd>
								</>) : (<>
									<dt>{localization.created}</dt>
									<dd>{createdTime}</dd>
								</>)}
							</dl>
						</div>

						{game.PasswordRequired ? (
							<div className="passwordInfo">
								<span>{localization.password}</span>

								<input
									id="password"
									type="password"
									aria-label='Password'
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
									onClick={() => props.onJoin(game.GameID, Role.Showman, navigateToGame)}
									title={localization.joinAsShowmanHint}
									disabled={!props.isConnected ||
										props.joinGameProgress ||
										(game.PasswordRequired && !props.password) ||
										!canJoinAsShowman}
								>
									{localization.joinAsShowman}
								</button>

								<button
									type="button"
									className="join standard"
									onClick={() => props.onJoin(game.GameID, Role.Player, navigateToGame)}
									title={localization.joinAsPlayerHint}
									disabled={!props.isConnected ||
										props.joinGameProgress ||
										(game.PasswordRequired && !props.password) ||
										!canJoinAsPlayer}
								>
									{localization.joinAsPlayer}
								</button>

								<button
									type="button"
									className="join standard"
									onClick={() => props.onJoin(game.GameID, Role.Viewer, navigateToGame)}
									title={localization.joinAsViewerHint}
									disabled={!props.isConnected || props.joinGameProgress || (game.PasswordRequired && !props.password)}
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
