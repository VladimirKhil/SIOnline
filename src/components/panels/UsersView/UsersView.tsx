import * as React from 'react';
import Trends from '../Trends/Trends';
import { useAppSelector } from '../../../state/new/hooks';

import './UsersView.css';

export default function UsersView(): JSX.Element | null {
	const settings = useAppSelector((state) => state.settings);

	return settings.isLobbyChatHidden ? null : (
		<section className="chatHost gamesblock">
			<div className="chatBody">
				<Trends />
			</div>
		</section>
	);
}
