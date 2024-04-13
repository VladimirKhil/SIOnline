import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../../model/resources/localization';
import uiActionCreators from '../../state/ui/uiActionCreators';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../common/FlyoutButton';
import roomActionCreators from '../../state/room/roomActionCreators';

import './RoomSettingsButton.css';

interface RoomSettingsButtonProps {
	onShowSettings: () => void;
	onShowAvatar: () => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
	onShowAvatar: () => {
		dispatch(roomActionCreators.avatarVisibleChanged(true));
	},
});

export function RoomSettingsButton(props: RoomSettingsButtonProps): JSX.Element {
	return (
		<FlyoutButton
			className="roomSettingsButton"
			title={localization.menu}
			flyout={(
				<ul>
					<li onClick={props.onShowSettings}>{localization.settings}</li>
					<li onClick={props.onShowAvatar}>{localization.avatar}</li>
				</ul>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
		>
			<span>⚙</span>
		</FlyoutButton>
	);
}

export default connect(null, mapDispatchToProps)(RoomSettingsButton);
