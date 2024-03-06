import * as React from 'react';
import NewGameDialog from './NewGameDialog';
import State from '../state/State';
import { INavigationState } from '../state/ui/UIState';
import { connect } from 'react-redux';

interface NewGameProps {
	navigation: INavigationState;
}

const mapStateToProps = (state: State) => ({
	navigation: state.ui.navigation,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function NewGame(props: NewGameProps): JSX.Element | null {
	return <NewGameDialog isSingleGame={props.navigation.newGameMode === 'single'} onClose={() => window.history.back()} />;
}

export default connect(mapStateToProps)(NewGame);
