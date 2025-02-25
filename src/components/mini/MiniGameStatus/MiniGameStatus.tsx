import React from 'react';
import { useAppSelector } from '../../../state/hooks';

import './MiniGameStatus.scss';

const MiniGameStatus: React.FC = () => {
	const playerName = useAppSelector((state) => state.room2.name);
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);

	return (
		<div className='miniGameStatus'>
			<span className='playerName'>{playerName}</span>
			<span className={`connectionStatus ${isConnected ? 'active' : ''}`}>●</span>
		</div>
	);
};

export default MiniGameStatus;