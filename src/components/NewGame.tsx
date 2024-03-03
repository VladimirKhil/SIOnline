import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NewGameDialog from './NewGameDialog';

interface LocationState {
	mode: 'single' | 'multi';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function NewGame(): JSX.Element | null {
	const navigate = useNavigate();
	const state = useLocation().state as LocationState;

	return <NewGameDialog isSingleGame={state.mode === 'single'} isLobby={false} onClose={() => navigate(-1)} />;
}
