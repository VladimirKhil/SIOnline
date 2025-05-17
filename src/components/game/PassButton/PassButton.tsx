import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { useAppSelector } from '../../../state/hooks';
import PlayerStates from '../../../model/enums/PlayerStates';

import './PassButton.scss';

interface PassButtonProps {
	onPass: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPass: () => {
		dispatch(roomActionCreators.onPass() as unknown as Action);
	},
});

export function PassButton(props: PassButtonProps): JSX.Element {
	const common = useAppSelector((state) => state.common);
	const room = useAppSelector((state) => state.room2);
	const me = room.persons.players.find(p => p.name === room.name);
	const canPass = me && (me.state === PlayerStates.None || me.state === PlayerStates.Lost);

	return (
		<button
			type="button"
			className={`passButton ${canPass ? '' : ' hidden'}`}
			disabled={!common.isSIHostConnected || !canPass}
			onClick={() => props.onPass()}
		>
			{localization.pass.toLocaleUpperCase()}
		</button>
	);
}

export default connect(null, mapDispatchToProps)(PassButton);