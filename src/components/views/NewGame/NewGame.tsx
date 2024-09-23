import * as React from 'react';
import NewGameDialog from '../../panels/NewGameDialog/NewGameDialog';
import { useAppSelector } from '../../../state/new/hooks';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function NewGame(): JSX.Element | null {
	const ui = useAppSelector(state => state.ui);
	return <NewGameDialog isSingleGame={ui.navigation.newGameMode === 'single'} onClose={() => window.history.back()} />;
}

export default NewGame;
