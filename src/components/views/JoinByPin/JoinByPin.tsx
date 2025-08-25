import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Role from '../../../model/Role';
import Constants from '../../../model/enums/Constants';
import ProgressDialog from '../../panels/ProgressDialog/ProgressDialog';
import { validateLoginName } from '../../../utils/loginValidation';
import { userErrorChanged } from '../../../state/commonSlice';

import './JoinByPin.scss';

export default function JoinByPin(): JSX.Element {
	const [pin, setPin] = React.useState(0);
	const appDispatch = useAppDispatch();
	const user = useAppSelector(state => state.user);
	const online = useAppSelector(state => state.online2);

	const [userName, setUserName] = React.useState(user.login);

	const onJoinByPin = () => {
		const validationError = validateLoginName(userName);

		if (validationError) {
			appDispatch(userErrorChanged(validationError));
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		appDispatch(onlineActionCreators.joinByPin(pin, userName.trim(), Role.Player, appDispatch) as any);
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			onJoinByPin();
		}
	};

	const onNameBlur = () => {
		const validationError = validateLoginName(userName);

		if (validationError) {
			appDispatch(userErrorChanged(validationError));
			return;
		}

		// Trim the username and update if changed
		const trimmedName = userName.trim();
		if (trimmedName !== userName) {
			setUserName(trimmedName);
		}
	};

	// Check if join button should be disabled
	const isJoinDisabled = () => online.joinGameProgress || validateLoginName(userName) !== null;

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
					onBlur={onNameBlur}
					maxLength={30}
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
				onClick={onJoinByPin}
				disabled={isJoinDisabled()}>
				{localization.joinAsPlayerHint}
			</button>
		</div>

		{online.joinGameProgress
			? <ProgressDialog title={localization.joiningGame} isIndeterminate={true} />
			: null}
	</Dialog>;
}