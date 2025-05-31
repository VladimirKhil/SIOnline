import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import localization from '../../../model/resources/localization';
import { RootState } from '../../../state/store';
import { openGameLog } from '../../../state/globalActions';

import './DownloadLogButton.scss';

const DownloadLogButton: React.FC = () => {
	const settings = useSelector((state: RootState) => state.settings);
	const common = useSelector((state: RootState) => state.common);
	const appDispatch = useDispatch();

	const handleDownload = () => {
		appDispatch(openGameLog());
	};

	return settings.writeGameLog && common.logSupported ? (
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