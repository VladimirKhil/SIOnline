import * as React from 'react';
import Trends from '../Trends/Trends';

import './UsersView.css';

export default function UsersView(): JSX.Element | null {
	return <section className="chatHost gamesblock">
		<div className="chatBody">
			<Trends />
		</div>
	</section>;
}
