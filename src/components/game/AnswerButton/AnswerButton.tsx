import localization from '../../../model/resources/localization';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import PlayerStates from '../../../model/enums/PlayerStates';
import { pressGameButton } from '../../../state/room2Slice';

import './AnswerButton.scss';

export default function AnswerButton() {
	const common = useAppSelector((state) => state.common);
	const room = useAppSelector((state) => state.room2);
	const table = useAppSelector((state) => state.table);
	const appDispatch = useAppDispatch();
	const me = room.persons.players.find(p => p.name === room.name);
	const canAnswer = me && (me.state === PlayerStates.None || me.state === PlayerStates.Lost);

	return (
		<button
			type='button'
			className={`playerButton mainAction active ${canAnswer ? '' : ' hidden'} ${table.canPress ? ' can-press' : ''}`}
			disabled={!common.isSIHostConnected || !room.isGameButtonEnabled || !canAnswer}
			onClick={() => appDispatch(pressGameButton())}>
			{localization.makeAnswer.toLocaleUpperCase()}
		</button>
	);
}
