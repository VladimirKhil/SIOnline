import localization from '../../../model/resources/localization';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import PlayerStates from '../../../model/enums/PlayerStates';
import { pressGameButton } from '../../../state/room2Slice';

import './AnswerButton.scss';

export default function AnswerButton() {
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);

	const { name, persons, isGameButtonEnabled } = useAppSelector((state) => ({
		name: state.room2.name,
		persons: state.room2.persons,
		isGameButtonEnabled: state.room2.isGameButtonEnabled,
	}));

	const canPress = useAppSelector((state) => state.table.canPress);
	const appDispatch = useAppDispatch();
	const me = persons.players.find(p => p.name === name);
	const canAnswer = me && (me.state === PlayerStates.None || me.state === PlayerStates.Lost);

	return (
		<button
			type='button'
			className={`playerButton mainAction active ${canAnswer ? '' : ' hidden'} ${canPress ? ' can-press' : ''}`}
			disabled={!isConnected || !isGameButtonEnabled || !canAnswer}
			onClick={() => appDispatch(pressGameButton())}>
			{localization.makeAnswer.toLocaleUpperCase()}
		</button>
	);
}
