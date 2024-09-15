import React from 'react';
import { useAppSelector } from '../../../state/new/hooks';

import './MiniGameStatus.scss';

const MiniGameStatus: React.FC = () => {
	const playerName = useAppSelector((state) => state.room.name);
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);

	return (
		<div className='miniGameStatus'>
			<span className='playerName'>{playerName}</span>
			<span className={`connectionStatus ${isConnected ? 'active' : ''}`}>●</span>
		</div>
	);
};

export default MiniGameStatus;