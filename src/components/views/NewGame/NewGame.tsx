import * as React from 'react';
import NewGameDialog from '../../panels/NewGameDialog/NewGameDialog';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function NewGame(): JSX.Element | null {
	const ui = useAppSelector(state => state.ui);
	const appDispatch = useAppDispatch();
	const canBack = window.history.length > 1;

	return <NewGameDialog
		isSingleGame={ui.navigation.newGameMode === 'single'}
		onClose={() => canBack
			? window.history.back()
			: appDispatch(navigate({ navigation: { path: Path.Menu }, saveState: true }))}
		/>;
}

export default NewGame;
