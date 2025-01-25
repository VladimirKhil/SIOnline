import * as React from 'react';
import NewGameDialog from '../../panels/NewGameDialog/NewGameDialog';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';
import localization from '../../../model/resources/localization';

import './NewGame.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function NewGame(): JSX.Element | null {
	const ui = useAppSelector(state => state.ui);
	const common = useAppSelector(state => state.common);
	const appDispatch = useAppDispatch();
	const canBack = window.history.length > 1;
	const [newGameMode, setNewGameMode] = React.useState(ui.navigation.newGameMode);

	if (!newGameMode) {
		return <div className='new__selector'>
			<div className={common.clearUrls ? 'logoMini' : 'logo'} />

			<div className='new__selector__buttons'>
				<button type='button' className='standard' onClick={() => setNewGameMode('single')}>{localization.playWithBots}</button>
				<button type='button' className='standard' onClick={() => setNewGameMode('multi')}>{localization.playWithFriends}</button>
			</div>
		</div>;
	}

	return <NewGameDialog
		isSingleGame={newGameMode === 'single'}
		onClose={() => canBack
			? window.history.back()
			: appDispatch(navigate({ navigation: { path: Path.Menu }, saveState: true }))}
		/>;
}

export default NewGame;
