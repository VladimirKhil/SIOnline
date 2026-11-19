import * as React from 'react';
import JoinMode from '../../../client/game/JoinMode';
import Role from '../../../client/models/Role';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { seat } from '../../../state/serverActions';
import State from '../../../state/State';

import './SeatButton.scss';

/** Identifies the table represented by the surrounding avatar. */
interface SeatButtonProps {
	isShowman: boolean;
	tableIndex: number;
	personName: string;
}

export function canTakeSeat(state: State, personName: string): boolean {
	return state.common.isSIHostConnected &&
		state.room2.role === Role.Viewer &&
		state.room2.joinMode !== JoinMode.OnlyViewer &&
		!personName.trim();
}

export default function SeatButton({ isShowman, tableIndex, personName }: SeatButtonProps): JSX.Element | null {
	const dispatch = useAppDispatch();
	const canSeat = useAppSelector(state => canTakeSeat(state, personName));

	if (!canSeat) {
		return null;
	}

	return (
		<button
			type='button'
			className='seatButton'
			title={localization.seat}
			aria-label={localization.seat}
			onClick={event => {
				event.stopPropagation();
				dispatch(seat({ isShowman, tableIndex }));
			}}
		>
			↓
		</button>
	);
}
