import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import { useAppSelector } from '../../../state/hooks';
import PlayerStates from '../../../model/enums/PlayerStates';

import './AnswerButton.scss';

interface AnswerButtonProps {
	isGameButtonEnabled: boolean;
	pressGameButton: () => void;
}

const mapStateToProps = (state: State) => ({
	isGameButtonEnabled: state.room.isGameButtonEnabled,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	pressGameButton: () => {
		dispatch(roomActionCreators.pressGameButton() as object as Action);
	},
});

export function AnswerButton(props: AnswerButtonProps) {
	const common = useAppSelector((state) => state.common);
	const room = useAppSelector((state) => state.room2);
	const me = room.persons.players.find(p => p.name === room.name);
	const canAnswer = me && (me.state === PlayerStates.None || me.state === PlayerStates.Lost);

	return (
		<button
			type='button'
			className={`playerButton mainAction active ${canAnswer ? '' : ' hidden'}`}
			disabled={!common.isSIHostConnected || !props.isGameButtonEnabled || !canAnswer}
			onClick={() => props.pressGameButton()}>
			{localization.makeAnswer.toLocaleUpperCase()}
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerButton);
