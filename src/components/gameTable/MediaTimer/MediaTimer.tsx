import * as React from 'react';
import Role from '../../../client/models/Role';
import TableMode from '../../../model/enums/TableMode';
import localization from '../../../model/resources/localization';
import { getLocalizedSeconds } from '../../../utils/TimeHelpers';
import { useAppSelector } from '../../../state/hooks';
import DemoContext from '../../../contexts/DemoContext';

import './MediaTimer.css';

/** Shows the showman how much time is left before the last audio or video ends and the answering border appears. */
export function MediaTimer(): JSX.Element | null {
	const isDemo = React.useContext(DemoContext);
	const role = useAppSelector(state => state.room2.role);
	const mode = useAppSelector(state => state.table.mode);
	const timeLeft = useAppSelector(state => Math.max(0, ...Object.values(state.ui.mediaTimeLeft)));

	if (isDemo || role !== Role.Showman || mode !== TableMode.Content || timeLeft === 0) {
		return null;
	}

	return <div className='mediaTimer' title={localization.timeLeft}>{timeLeft} {getLocalizedSeconds(timeLeft)}</div>;
}

export default MediaTimer;
