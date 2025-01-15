import React from 'react';
import { connect } from 'react-redux';
import SettingsButton from '../SettingsButton/SettingsButton';
import { useAppSelector } from '../../../state/hooks';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Path from '../../../model/enums/Path';
import State from '../../../state/State';

import './UserOptions.css';

interface UserOptionsProps {
	path: Path;
	onShowAvatar: () => void;
}

const mapStateToProps = (state: State) => ({
	path: state.ui.navigation.path,
});

const mapDispatchToProps = (dispatch: any) => ({
	onShowAvatar: () => {
		dispatch(roomActionCreators.avatarVisibleChanged(true));
	},
});

const UserOptions: React.FC<UserOptionsProps> = (props: UserOptionsProps) => {
	const user = useAppSelector(state => state.user);

	const userInfo = <div>
		{user.avatar ? <img className='userAvatar' src={user.avatar} alt='Avatar' /> : null}
		<span className='user'>{user.login}</span>
	</div>;

	return (
		<div className='userOptions'>
			<SettingsButton />

			{props.path === Path.Room ? <FlyoutButton
				className='userInfo'
				title={user.login}
				flyout={(
					<ul>
						<li onClick={props.onShowAvatar}>{localization.avatar}</li>
					</ul>
				)}
				horizontalOrientation={FlyoutHorizontalOrientation.Left}
				verticalOrientation={FlyoutVerticalOrientation.Bottom}>
				{userInfo}
			</FlyoutButton> : <div className='userInfo'>{ userInfo }</div>}
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserOptions);