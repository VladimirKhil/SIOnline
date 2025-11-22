import React from 'react';
import Path from '../../../model/enums/Path';
import State from '../../../state/State';
import JoinRoom from '../../views/JoinRoom/JoinRoom';
import TableContextView from '../../game/TableContextView/TableContextView';
import { connect } from 'react-redux';
import { useAppSelector } from '../../../state/hooks';
import ErrorView from '../../views/Error/ErrorView';
import localization from '../../../model/resources/localization';
import MiniGameStatus from '../MiniGameStatus/MiniGameStatus';
import UserError from '../../panels/UserError/UserError';

import './MiniApp.scss';

interface MiniAppProps {
	path: Path;
}

const mapStateToProps = (state: State) => ({
	path: state.ui.navigation.path,
});

const getContent = (path: Path) => {
	switch (path) {
		case Path.Login:
			return <div>{localization.connectionClosed}</div>;

		case Path.Room:
			return <div className='miniRoom'><MiniGameStatus /><TableContextView /></div>;

		case Path.JoinRoom:
			return <JoinRoom canJoinAsViewer={false} />;

		default:
			return null;
	}
};

/** Provides simplified view allowing only to join an existing game. */
const MiniApp: React.FC<MiniAppProps> = (props: MiniAppProps) => {
	const { error, userError, messageLevel } = useAppSelector(state => ({
		error: state.common.error,
		userError: state.common.userError,
		messageLevel: state.common.messageLevel,
	}));

	return error
		? <ErrorView error={error} />
		: <div className='miniApp'>
			{getContent(props.path)}
			{userError ? <UserError error={userError} messageLevel={messageLevel} /> : null}
		</div>;
};

export default connect(mapStateToProps)(MiniApp);