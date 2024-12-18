import * as React from 'react';
import { connect } from 'react-redux';
import Account from '../../../model/Account';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import FlyoutButton, { FlyoutHorizontalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch } from '../../../state/new/hooks';
import { kick, setHost } from '../../../state/new/room2Slice';
import getAvatarClass from '../../../utils/AccountHelpers';

import './PersonView.css';

interface PersonViewProps {
	account: Account;
	login: string;
	avatar: string | null;
	hostName: string | null;
}

const mapStateToProps = (state: State) => ({
	login: state.room.name,
	avatar: state.user.avatar,
	hostName: state.room.persons.hostName
});

export function PersonView(props: PersonViewProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const isMe = props.account.name === props.login;
	const isHost = props.account.name === props.hostName;

	const avatar = isMe ? props.avatar : props.account.avatar;
	const canManage = props.hostName === props.login && !isMe && props.account.isHuman;

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
						<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="14" cy="19.5" r="1.5" fill="#2649FF"/>
							<circle cx="14" cy="14" r="1.5" fill="#2649FF"/>
							<circle cx="14" cy="8.5" r="1.5" fill="#2649FF"/>
						</svg>
					</FlyoutButton>
				</div>)
				: null}
		</li>
	);
}

export default connect(mapStateToProps)(PersonView);
