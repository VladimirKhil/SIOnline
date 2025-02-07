import React from 'react';
import localization from '../../../model/resources/localization';
import { connect } from 'react-redux';
import onlineActionCreators from '../../../state/online/onlineActionCreators';

import './NewGameButton.scss';

interface NewGameButtonProps {
	onNewGame: () => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	onNewGame: () => {
		dispatch(onlineActionCreators.newGame());
	}
});

const NewGameButton: React.FC<NewGameButtonProps> = (props: NewGameButtonProps) => (
	<button
		className='newGame standard'
		type="button"
		onClick={props.onNewGame}
	>
		{localization.newGame.toLocaleUpperCase()}
	</button>
);

export default connect(null, mapDispatchToProps)(NewGameButton);