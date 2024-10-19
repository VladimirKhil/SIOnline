import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Role from '../../../model/Role';

import './JoinByPin.scss';

export default function JoinByPin(): JSX.Element {
	const [pin, setPin] = React.useState(0);
	const appDispatch = useAppDispatch();
	const user = useAppSelector(state => state.user);

	const onJoinByPin = () => {
		appDispatch(onlineActionCreators.joinByPin(pin, user.login, Role.Player, appDispatch) as any);
	};

	return <Dialog className='enterPin' title={localization.enterPin} onClose={() => window.history.back()}>
		<div className='enterPinBody'>
			<input
				value={pin}
				onChange={e => setPin(parseInt(e.target.value, 10))}
				className='pin'
				title='PIN'
				type='number'
				placeholder={localization.getPin} />

			<button
				className='pinJoin standard'
				type='button'
				title='Enter'
				onClick={onJoinByPin}>
				{localization.gameJoin}
			</button>
		</div>
	</Dialog>;
}