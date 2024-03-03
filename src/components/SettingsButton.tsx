import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import uiActionCreators from '../state/ui/uiActionCreators';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import { useNavigate } from 'react-router-dom';
import Path from '../model/enums/Path';

import './SettingsButton.css';

interface SettingsButtonProps {
	onShowSettings: () => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
});

export function SettingsButton(props: SettingsButtonProps): JSX.Element {
	const navigate = useNavigate();

	return (
		<FlyoutButton
			className="settingsButton"
			flyout={(
				<ul>
					<li onClick={props.onShowSettings}>{localization.settings}</li>
					<li onClick={() => navigate(Path.About)}>{localization.aboutTitle}</li>
					<li onClick={() => navigate(Path.Menu)}>{localization.exit}</li>
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
