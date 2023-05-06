import * as React from 'react';
import { connect } from 'react-redux';
import { Action } from 'redux';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import uiActionCreators from '../state/ui/uiActionCreators';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';

import './SettingsButton.css';

interface SettingsButtonProps {
	onShowSettings: () => void;
	onHowToPlay: () => void;
	onExit: () => void;
}

const mapDispatchToProps = (dispatch: any) => ({
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

export function SettingsButton(props: SettingsButtonProps): JSX.Element {
	return (
		<FlyoutButton
			className="settingsButton"
			flyout={(
				<ul>
					<li onClick={props.onShowSettings}>{localization.settings}</li>
					<li onClick={props.onHowToPlay}>{localization.aboutTitle}</li>
					<li onClick={props.onExit}>{localization.exit}</li>
				</ul>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
		>
			<span>⚙</span>
		</FlyoutButton>
	);
}

export default connect(null, mapDispatchToProps)(SettingsButton);
