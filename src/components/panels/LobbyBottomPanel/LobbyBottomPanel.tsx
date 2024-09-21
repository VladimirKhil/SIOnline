import React, { Dispatch } from 'react';
import NewGameButton from '../NewGameButton/NewGameButton';
import { useAppSelector } from '../../../state/new/hooks';
import OnlineMode from '../../../model/enums/OnlineMode';
import localization from '../../../model/resources/localization';
import uiActionCreators from '../../../state/ui/uiActionCreators';
import { connect } from 'react-redux';
import { Action } from 'redux';

import './LobbyBottomPanel.scss';

interface LobbyBottomPanelProps {
	onOnlineModeChanged: (view: OnlineMode) => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onOnlineModeChanged: (view: OnlineMode) => {
		dispatch(uiActionCreators.onOnlineModeChanged(view));
	},
});

const LobbyBottomPanel: React.FC<LobbyBottomPanelProps> = (props: LobbyBottomPanelProps) => {
	const ui = useAppSelector(state => state.ui);

	const changeView = (view: OnlineMode) => {
		props.onOnlineModeChanged(view);
	};

	return (<div className='lobbyBottomPanel'>
		<NewGameButton />

		{ui.onlineView === OnlineMode.Games || ui.onlineView === OnlineMode.GameInfo ? (
			<button type='button' className='standard' onClick={() => changeView(OnlineMode.Chat)}>{localization.trends}</button>
		) : <button type='button' className='standard' onClick={() => changeView(OnlineMode.Games)}>{localization.games}</button>}
	</div>);
};

export default connect(null, mapDispatchToProps)(LobbyBottomPanel);