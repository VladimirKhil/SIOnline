import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';
import GameInfoView from '../../panels/GameInfoView/GameInfoView';
import Path from '../../../model/enums/Path';
import { userErrorChanged } from '../../../state/commonSlice';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { navigate } from '../../../utils/Navigator';

import './JoinRoom.css';

interface JoinRoomProps {
	canJoinAsViewer: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function JoinRoom(props: JoinRoomProps): JSX.Element | null {
	const onlineState = useAppSelector(state => state.online2);
	const common = useAppSelector(state => state.common);
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
	}, [onlineState.inProgress]);

	if (!selectedGame) {
		return null;
	}

	return <div className='joinRoomHost'>
		<div className='logo' />

		<Dialog
			className="joinRoom"
			title={`${localization.gameJoin}: ${selectedGame.GameName}`}
			onClose={navigateToLogin}>
			<GameInfoView canJoinAsViewer={props.canJoinAsViewer} isConnected={common.isSIHostConnected} game={selectedGame} showGameName={false} />
		</Dialog>
	</div>;
}
