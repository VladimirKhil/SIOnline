import * as React from 'react';
import { useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import PersonName from '../../game/PlayerView/PersonName';

import './TableLeaderboard.css';

export default function TableLeaderboard(): JSX.Element | null {
	const statistics = useAppSelector((state) => state.table.statistics);

	if (!statistics || statistics.length === 0) {
		return null;
	}

	return (
		<div className="tableStatistics tableLeaderboard">
			<div className="statisticsTable">
				<div className="statisticsTableHeader leaderboardTableHeader">
					<div className="statCell position">{localization.position}</div>
					<div className="statCell playerName">{localization.player}</div>
					<div className="statCell currentScore">{localization.score}</div>
				</div>

				{statistics.map((stat, index) => (
					<div key={stat.name} className={`statisticsTableRow leaderboardTableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
						<div className="statCell position">
							<AutoSizedText maxFontSize={56}>
								{index + 1}
							</AutoSizedText>
						</div>
						<div className="statCell playerName">
							<AutoSizedText maxFontSize={56}>
								<PersonName name={stat.name} />
							</AutoSizedText>
						</div>
						<div className="statCell currentScore">
							<AutoSizedText maxFontSize={40}>
								{stat.currentScore !== undefined ? stat.currentScore : ' '}
							</AutoSizedText>
						</div>
					</div>
				))}
			</div>

			<div className="statisticsFooter">{localization.tableLogoAuthor}</div>
		</div>
	);
}