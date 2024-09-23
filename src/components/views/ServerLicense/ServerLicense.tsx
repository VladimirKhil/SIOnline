import * as React from 'react';
import { connect } from 'react-redux';
import { useState } from 'react';
import localization from '../../../model/resources/localization';
import actionCreators from '../../../logic/actionCreators';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import { AppDispatch } from '../../../state/new/store';

import './ServerLicense.css';

interface ServerLicenseProps {
	accept: (appDispath: AppDispatch) => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	accept: (appDispath: AppDispatch) => {
		dispatch(actionCreators.acceptLicense(appDispath));
	},
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ServerLicense(props: ServerLicenseProps): JSX.Element | null {
	const [accepted, setAccepted] = useState(false);
	const appDispatch = useAppDispatch();
	const common = useAppSelector(state => state.common);

	return (
		<div className='server__license'>
			<div className='server__license__body'>
				<div className='license__header'>{localization.serverLicense}</div>
				<div className='license__text'>{common.serverLicense}</div>

				<input
					id='accept'
					type='checkbox'
					checked={accepted}
					onChange={() => setAccepted(!accepted)} />

				<label htmlFor='accept'>{localization.acceptLicense}</label>

				<div className='license__button__area'>
					<button type='button' className='standard' disabled={!accepted} onClick={() => props.accept(appDispatch)}>OK</button>
				</div>
			</div>
		</div>
	);
}

export default connect(null, mapDispatchToProps)(ServerLicense);
