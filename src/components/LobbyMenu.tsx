import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import OnlineMode from '../model/enums/OnlineMode';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import uiActionCreators from '../state/ui/uiActionCreators';

import './LobbyMenu.css';

interface LobbyMenuProps {
	onShowGames: () => void;
	onShowChat: () => void;
	onHowToPlay: () => void;
	onShowSettings: () => void;
	onExit: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onShowGames: () => {
		dispatch(uiActionCreators.onOnlineModeChanged(OnlineMode.Games));
	},
	onShowChat: () => {
		dispatch(uiActionCreators.onOnlineModeChanged(OnlineMode.Chat));
	},
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
	onHowToPlay: () => {
		dispatch(uiActionCreators.navigateToHowToPlay());
	},
	onExit: () => {
		dispatch(actionCreators.onExit() as unknown as Action);
	}
});

export function LobbyMenu(props: LobbyMenuProps): JSX.Element {
	return (
		<FlyoutButton
			className="navButton"
			flyout={(
				<ul>
					<li onClick={props.onShowGames}>{localization.games}</li>
					<li onClick={props.onShowChat}>{localization.chat}</li>
					<li onClick={props.onShowSettings}>{localization.settings}</li>
					<li onClick={props.onHowToPlay}>{localization.aboutTitle}</li>
					<li onClick={props.onExit}>{localization.exit}</li>
				</ul>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Right}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
		>
			<span>☰</span>
		</FlyoutButton>
	);
}

export default connect(null, mapDispatchToProps)(LobbyMenu);
