import React from 'react';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import { connect, useSelector } from 'react-redux';
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

const NewGameButton: React.FC<NewGameButtonProps> = (props: NewGameButtonProps) => {
	const common = useSelector((state: State) => state.common);

	return (
		<button
			className='newGame standard'
			type="button"
			disabled={!common.isConnected}
			onClick={props.onNewGame}
		>
			{localization.newGame.toLocaleUpperCase()}
		</button>
	);
};

export default connect(null, mapDispatchToProps)(NewGameButton);