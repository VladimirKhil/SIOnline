import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { openGameLog } from '../../../state/globalActions';

import './DownloadLogButton.scss';

const DownloadLogButton: React.FC = () => {
	const writeGameLog = useAppSelector(state => state.settings.writeGameLog);
	const logSupported = useAppSelector(state => state.common.logSupported);
	const appDispatch = useAppDispatch();

	const handleDownload = () => {
		appDispatch(openGameLog());
	};

	return writeGameLog && logSupported ? (
		<button
			type='button'
			onClick={handleDownload}
			className='standard download-log'
			title={localization.downloadGameLog}
		>
			📩
		</button>
	) : null;
};

export default DownloadLogButton;