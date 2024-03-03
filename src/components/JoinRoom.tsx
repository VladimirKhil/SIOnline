import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameInfo from '../client/contracts/GameInfo';
import State from '../state/State';
import Dialog from './common/Dialog';
import GameInfoView from './GameInfoView';
import { connect } from 'react-redux';
import Path from '../model/enums/Path';

interface JoinRoomProps {
	inProgress: boolean;
	games: Record<number, GameInfo>;
}

interface LocationState {
	gameId: number;
}

const mapStateToProps = (state: State) => ({
	inProgress: state.online.inProgress,
	games: state.online.games,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function JoinRoom(props: JoinRoomProps): JSX.Element | null {
	const navigate = useNavigate();
	const state = useLocation().state as LocationState;
	const selectedGame = props.games[state.gameId];

	React.useEffect(() => {
		if (!props.inProgress && !selectedGame) {
			alert('Game not found');
			navigate(Path.Menu);
		}
	}, [props.inProgress]);

	if (!selectedGame) {
		return null;
	}

	return <Dialog className="gameInfoDialog2" title={selectedGame.GameName} onClose={() => navigate(Path.Menu)}>
		<GameInfoView game={selectedGame} showGameName={false} />
	</Dialog>;
}

export default connect(mapStateToProps)(JoinRoom);
