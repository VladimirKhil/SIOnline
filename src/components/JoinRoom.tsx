import * as React from 'react';
import GameInfo from '../client/contracts/GameInfo';
import State from '../state/State';
import Dialog from './common/Dialog';
import GameInfoView from './GameInfoView';
import { connect } from 'react-redux';
import Path from '../model/enums/Path';
import uiActionCreators from '../state/ui/uiActionCreators';
import { Action } from 'redux';

interface JoinRoomProps {
	inProgress: boolean;
	games: Record<number, GameInfo>;
	gameId?: number;
	navigate: (path: Path) => void;
}

const mapStateToProps = (state: State) => ({
	inProgress: state.online.inProgress,
	games: state.online.games,
	gameId: state.ui.navigation.gameId,
});

const mapDispatchToProps = (dispatch: React.Dispatch<Action>) => ({
	navigate: (path: Path) => {
		dispatch(uiActionCreators.navigate({ path: path }) as unknown as Action); // TODO: fix typing
	},
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function JoinRoom(props: JoinRoomProps): JSX.Element | null {
	const selectedGame = props.gameId ? props.games[props.gameId] : null;

	React.useEffect(() => {
		if (!props.inProgress && !selectedGame) {
			alert('Game not found');
			props.navigate(Path.Menu);
		}
	}, [props.inProgress]);

	if (!selectedGame) {
		return null;
	}

	return <Dialog className="gameInfoDialog2" title={selectedGame.GameName} onClose={() => props.navigate(Path.Menu)}>
		<GameInfoView game={selectedGame} showGameName={false} />
	</Dialog>;
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinRoom);
