import * as React from 'react';
import Role from '../../../model/Role';
import TableMode from '../../../model/enums/TableMode';
import localization from '../../../model/resources/localization';
import { getLocalizedSeconds } from '../../../utils/TimeHelpers';
import { useAppSelector } from '../../../state/hooks';

import './MediaTimer.css';

/** Shows the showman how much time is left before the audio or video ends and the answering border appears. */
export function MediaTimer(): JSX.Element | null {
	const role = useAppSelector(state => state.room2.role);
	const mode = useAppSelector(state => state.table.mode);
	const timeLeft = useAppSelector(state => state.ui.mediaTimeLeft);

	if (role !== Role.Showman || mode !== TableMode.Content || timeLeft === 0) {
		return null;
	}

	return <div className='mediaTimer' title={localization.timeLeft}>{timeLeft} {getLocalizedSeconds(timeLeft)}</div>;
}

export default MediaTimer;
