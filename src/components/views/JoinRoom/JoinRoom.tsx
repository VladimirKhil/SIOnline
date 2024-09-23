import * as React from 'react';
import State from '../../../state/State';
import Dialog from '../../common/Dialog/Dialog';
import GameInfoView from '../../GameInfoView';
import { connect } from 'react-redux';
import Path from '../../../model/enums/Path';
import { userErrorChanged } from '../../../state/new/commonSlice';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import localization from '../../../model/resources/localization';
import { navigate } from '../../../utils/Navigator';

import './JoinRoom.css';

interface JoinRoomProps {
	inProgress: boolean;
}

const mapStateToProps = (state: State) => ({
	inProgress: state.online.inProgress,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function JoinRoom(props: JoinRoomProps): JSX.Element | null {
	const onlineState = useAppSelector(state => state.online2);
	const { selectedGame } = onlineState;
	const appDispatch = useAppDispatch();

	const navigateToLogin = () => {
		appDispatch(navigate({ navigation: { path: Path.Login }, saveState: true }));
	};

	React.useEffect(() => {
		if (!selectedGame) {
			appDispatch(userErrorChanged(localization.gameNotFound));
			navigateToLogin();
		}
	}, [props.inProgress]);

	if (!selectedGame) {
		return null;
	}

	return <div className='joinRoomHost'>
		<div className='logo' />

		<Dialog
			className="joinRoom"
			title={`${localization.gameJoin}: ${selectedGame.GameName}`}
			onClose={navigateToLogin}>
			<GameInfoView game={selectedGame} showGameName={false} />
		</Dialog>
	</div>;
}

export default connect(mapStateToProps)(JoinRoom);
