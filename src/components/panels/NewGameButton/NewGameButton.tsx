import React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/hooks';
import { newGame } from '../../../state/online2Slice';

import './NewGameButton.scss';

const NewGameButton: React.FC = () => {
	const appDispatch = useAppDispatch();

	return <button
		className='newGame standard'
		type="button"
		onClick={() => appDispatch(newGame())}
	>
		{localization.newGame.toLocaleUpperCase()}
	</button>;
};

export default NewGameButton;