import React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { newGame } from '../../../state/online2Slice';

import './NewGameButton.scss';

interface NewGameButtonProps {
	simple?: boolean;
}

const NewGameButton: React.FC<NewGameButtonProps> = ({ simple }) => {
	const appDispatch = useAppDispatch();
	const online = useAppSelector(state => state.online2);

	return <button
		className={`newGame standard ${simple ? ' simple' : ''}`}
		type="button"
		title={simple ? localization.newGame : undefined}
		disabled={online.gameCreationProgress || online.joinGameProgress}
		onClick={() => appDispatch(newGame())}
	>
		{simple ? '+' : localization.newGame.toLocaleUpperCase()}
	</button>;
};

export default NewGameButton;