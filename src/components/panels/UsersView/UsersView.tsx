import * as React from 'react';
import Trends from '../Trends/Trends';
import { useAppSelector } from '../../../state/hooks';
import OnlineMode from '../../../model/enums/OnlineMode';

import './UsersView.css';

export default function UsersView(): JSX.Element | null {
	const ui = useAppSelector(state => state.ui);

	return <section className={`chatHost gamesblock ${ui.onlineView === OnlineMode.Games ? 'bottom' : 'top'}`}>
		<div className="chatBody">
			<Trends />
		</div>
	</section>;
}
