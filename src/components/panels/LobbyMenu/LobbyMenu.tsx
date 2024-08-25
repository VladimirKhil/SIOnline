import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import OnlineMode from '../../../model/enums/OnlineMode';
import localization from '../../../model/resources/localization';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton';
import uiActionCreators from '../../../state/ui/uiActionCreators';
import State from '../../../state/State';
import Path from '../../../model/enums/Path';

import './LobbyMenu.css';

interface LobbyMenuProps {
	currentMode: OnlineMode;

	onShowGames: () => void;
	onShowChat: () => void;
	onShowSettings: () => void;
	navigate: (path: Path) => void;
}

const mapStateToProps = (state: State) => ({
	currentMode: state.ui.onlineView,
});

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
	navigate: (path: Path) => {
		dispatch(uiActionCreators.navigate({ path: path }) as unknown as Action);
	}
});

export function LobbyMenu(props: LobbyMenuProps): JSX.Element {
	return (
		<FlyoutButton
			className="navButton"
			flyout={(
				<ul>
					<li className={props.currentMode === OnlineMode.Games ? 'activeMenuItem' : ''} onClick={props.onShowGames}>
						{localization.games}
					</li>

					<li className={props.currentMode === OnlineMode.Chat ? 'activeMenuItem' : ''} onClick={props.onShowChat}>
						{localization.trends}
					</li>

					<li onClick={props.onShowSettings}>{localization.settings}</li>
					<li onClick={() => props.navigate(Path.Menu)}>{localization.exit}</li>
				</ul>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Right}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
		>
			<span>☰</span>
		</FlyoutButton>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyMenu);
