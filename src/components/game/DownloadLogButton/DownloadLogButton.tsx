import React from 'react';
import { useSelector } from 'react-redux';
import localization from '../../../model/resources/localization';
import { RootState } from '../../../state/store';

import './DownloadLogButton.scss';

const DownloadLogButton: React.FC = () => {
	const gameLog = useSelector((state: RootState) => state.room2.gameLog);
	const settings = useSelector((state: RootState) => state.settings);

	const handleDownload = () => {
		if (!gameLog || gameLog.length === 0) {
			alert('No game log available to download');
			return;
		}

		// Format game log as text
		const logText = gameLog.join('\n');

		// Create a blob with the game log
		const blob = new Blob([logText], { type: 'text/plain' });

		// Create a temporary URL for the blob
		const url = URL.createObjectURL(blob);

		// Create a download link and click it
		const link = document.createElement('a');
		link.href = url;
		link.download = `game-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
		document.body.appendChild(link);
		link.click();

		// Clean up
		URL.revokeObjectURL(url);
		document.body.removeChild(link);
	};

	return settings.writeGameLog ? (
		<button
			type='button'
			onClick={handleDownload}
			disabled={!gameLog || gameLog.length === 0}
			className='standard download-log'
			title={localization.downloadGameLog}
		>
			📩
		</button>
	) : null;
};

export default DownloadLogButton;