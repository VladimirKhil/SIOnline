import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Role from '../../../model/Role';
import Constants from '../../../model/enums/Constants';

import './JoinByPin.scss';

export default function JoinByPin(): JSX.Element {
	const [pin, setPin] = React.useState(0);
	const appDispatch = useAppDispatch();
	const user = useAppSelector(state => state.user);

	const [userName, setUserName] = React.useState(user.login);

	const onJoinByPin = () => {
		appDispatch(onlineActionCreators.joinByPin(pin, userName, Role.Player, appDispatch) as any);
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			onJoinByPin();
		}
	};

	return <Dialog className='enterPin' title={localization.joinByPin} onClose={() => window.history.back()}>
		<div className='enterPinBody'>
			<div className="pinBlock">
				<span className='field-header'>{localization.name}</span>

				<input
					id="name"
					type="text"
					aria-label='Name'
					value={userName}
					onChange={e => setUserName(e.target.value)}
					onKeyPress={onKeyPress}
				/>
			</div>

			<div className="pinBlock">
				<span className='field-header'>{localization.pin}</span>

				<input
					value={pin}
					onChange={e => setPin(parseInt(e.target.value, 10))}
					className='pin'
					title='PIN'
					type='number'
					placeholder={localization.getPin}
					onKeyPress={onKeyPress} />
			</div>

			<button
				className='pinJoin standard'
				type='button'
				onClick={onJoinByPin}>
				{localization.joinAsPlayerHint}
			</button>
		</div>
	</Dialog>;
}