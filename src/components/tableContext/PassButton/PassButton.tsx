import * as React from 'react';
import localization from '../../../model/resources/localization';
import { onPass } from '../../../state/serverActions';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import PlayerStates from '../../../client/models/enums/PlayerStates';

import './PassButton.scss';

export default function PassButton(): JSX.Element {
	const appDispatch = useAppDispatch();
	const name = useAppSelector((state) => state.room2.name);
	const persons = useAppSelector((state) => state.room2.persons);
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);

	const me = persons.players.find(p => p.name === name);
	const canPass = me && (me.state === PlayerStates.None || me.state === PlayerStates.Lost);

	return (
		<button
			type="button"
			className={`passButton ${canPass ? '' : ' hidden'}`}
			disabled={!isConnected || !canPass}
			onClick={() => appDispatch(onPass())}
		>
			{localization.pass.toLocaleUpperCase()}
		</button>
	);
}
