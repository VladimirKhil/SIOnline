import * as React from 'react';
import Trends from '../Trends/Trends';
import { useAppSelector } from '../../../state/hooks';
import OnlineMode from '../../../model/enums/OnlineMode';

import './UsersView.css';

export default function UsersView(): JSX.Element | null {
	const onlineView = useAppSelector(state => state.ui.onlineView);

	return <section className={`chatHost gamesblock ${onlineView === OnlineMode.Games ? 'bottom' : 'top'}`}>
		<div className="chatBody">
			<Trends />
		</div>
	</section>;
}
