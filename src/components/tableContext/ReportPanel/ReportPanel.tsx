import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppSelector } from '../../../state/hooks';

import './ReportPanel.css';

export default function ReportPanel(): JSX.Element | null {
	const packageUri = useAppSelector(state => state.room2.playState.packageUri);

	return (
		<div className="reportPanel">
			<button
				type="button"
				className="report_button standard"
				onClick={() => window.open('https://steamcommunity.com/app/3553500/reviews/', '_blank')}
			>
				<span>{`⭐ ${localization.rateGame}`}</span>
			</button>

			{packageUri ? (
				<button
					type="button"
					className="report_button standard"
					onClick={() => window.open(packageUri, '_blank')}
				>
					<span>{`📦 ${localization.reviewPackage}`}</span>
				</button>
			) : null}
		</div>
	);
}