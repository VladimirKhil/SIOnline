import * as React from 'react';
import { connect } from 'react-redux';
import { useState } from 'react';
import localization from '../model/resources/localization';
import State from '../state/State';
import userActionCreators from '../state/user/userActionCreators';

import './ServerLicense.css';

interface ServerLicenseProps {
	serverLicense: string | null;
	accept: () => void;
}

const mapStateToProps = (state: State) => ({
	serverLicense: state.common.serverLicense,
});

const mapDispatchToProps = (dispatch: any) => ({
	accept: () => {
		dispatch(userActionCreators.acceptLicense());
	},
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ServerLicense(props: ServerLicenseProps): JSX.Element | null {
	const [accepted, setAccepted] = useState(false);

	return (
		<div className='server__license'>
			<div className='server__license__body'>
				<div className='license__header'>{localization.serverLicense}</div>
				<div className='license__text'>{props.serverLicense}</div>

				<input
					id='accept'
					type='checkbox'
					checked={accepted}
					onChange={() => setAccepted(!accepted)} />

				<label htmlFor='accept'>{localization.acceptLicense}</label>

				<div className='license__button__area'>
					<button type='button' className='standard' disabled={!accepted} onClick={props.accept}>OK</button>
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerLicense);
