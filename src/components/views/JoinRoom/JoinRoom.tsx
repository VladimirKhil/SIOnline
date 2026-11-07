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
	showCloseButton?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function JoinRoom(props: JoinRoomProps): JSX.Element | null {
	const selectedGame = useAppSelector(state => state.online2.selectedGame);
	const inProgress = useAppSelector(state => state.online2.inProgress);
	const appDispatch = useAppDispatch();

	const navigateToLogin = () => {
		appDispatch(navigate({ navigation: { path: Path.Login }, saveState: true }));
	};

	React.useEffect(() => {
		if (!selectedGame) {
			appDispatch(userErrorChanged(localization.gameNotFound));
			navigateToLogin();
		}
	}, [inProgress]);

	if (!selectedGame) {
		return null;
	}

	return <div className='joinRoomHost'>
		<Dialog
			className="joinRoom animated"
			title={`${localization.gameJoin}: ${selectedGame.GameName}`}
			onClose={props.showCloseButton !== false ? navigateToLogin : undefined}>
			<div className='logo' />
			<GameInfoView canJoinAsViewer={props.canJoinAsViewer} game={selectedGame} showGameName={false} />
		</Dialog>
	</div>;
}
