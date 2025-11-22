import * as React from 'react';
import { connect } from 'react-redux';
import Account from '../../../model/Account';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import FlyoutButton, { FlyoutHorizontalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { kick, setHost } from '../../../state/room2Slice';
import getAvatarClass from '../../../utils/AccountHelpers';

import './PersonView.css';
import menuSvg from '../../../../assets/images/menu.svg';

interface PersonViewProps {
	account: Account;
	avatar: string | null;
}

const mapStateToProps = (state: State) => ({
	avatar: state.user.avatar,
});

export function PersonView(props: PersonViewProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const { name, persons } = useAppSelector(state => ({
		name: state.room2.name,
		persons: state.room2.persons,
	}));

	const isMe = props.account.name === name;
	const isHost = props.account.name === persons.hostName;

	const avatar = isMe ? props.avatar : props.account.avatar;
	const canManage = persons.hostName === name && !isMe && props.account.isHuman;

	return (
		<li className={`personItem ${isMe ? 'me' : ''}`}>
			<div
				className={`personItem_avatar ${getAvatarClass(props.account)}`}
				style={{ backgroundImage: avatar ? `url("${avatar}")` : undefined }}
			/>

			<div className='personNameWrapper'>
				<span className='personName'>
					{props.account.name}
				</span>
			</div>

			{isHost ? (<span className="personItem_host" role="img" aria-label="star" title={localization.host}>⭐</span>) : null}

			{canManage ? (
				<div className='personItem_menuHost'>
					<FlyoutButton
						className='personItem_menu'
						horizontalOrientation={FlyoutHorizontalOrientation.Left}
						flyout={
						<ul className="personMenu">
							<li onClick={() => appDispatch(setHost(props.account.name))}>{localization.setHost}</li>
							<li onClick={() => appDispatch(kick(props.account.name))}>{localization.kick}</li>
						</ul>
					}>
						<img src={menuSvg} alt={localization.menu} className="personItem_menuIcon" />
					</FlyoutButton>
				</div>)
				: null}
		</li>
	);
}

export default connect(mapStateToProps)(PersonView);
