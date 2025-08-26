import * as React from 'react';
import { useAppSelector } from '../../../state/hooks';
import PlayerStatistics from '../../../model/PlayerStatistics';
import localization from '../../../model/resources/localization';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import Constants from '../../../model/enums/Constants';

import './TableStatistics.css';

export default function TableStatistics(): JSX.Element | null {
	const statistics = useAppSelector((state) => state.table.statistics);
	const currentPlayers = useAppSelector((state) => state.room2.persons.players);

	if (!statistics || statistics.length === 0) {
		return null;
	}

	// Calculate final scores for sorting and add current scores to statistics
	const enhancedStatistics: PlayerStatistics[] = statistics.filter(stat => stat.name && stat.name !== Constants.ANY_NAME).map(stat => {
		const currentPlayer = currentPlayers.find(p => p.name === stat.name);
		const currentScore = currentPlayer?.sum ?? undefined;

		return {
			...stat,
			currentScore,
		};
	});

	// Sort players by final score in descending order
	const sortedStatistics = enhancedStatistics.sort((a, b) => (b.currentScore ?? 0) - (a.currentScore ?? 0));

	return (
		<div className="tableStatistics">
			<div className="statisticsTable">
				<div className="statisticsTableHeader">
					<div className="statCell position">{localization.position}</div>
					<div className="statCell playerName">{localization.player}</div>
					<div className="statCell currentScore">{localization.score}</div>
					<div className="statCell">{localization.scoreEarned}</div>
					<div className="statCell">{localization.scoreLost}</div>
					<div className="statCell rightAnswers">{localization.rightAnswers}</div>
					<div className="statCell wrongAnswers">{localization.wrongAnswers}</div>
				</div>

				{sortedStatistics.map((stat, index) => (
					<div key={stat.name} className={`statisticsTableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
						<div className="statCell position">
							<AutoSizedText maxFontSize={56}>
								{index + 1}
							</AutoSizedText>
						</div>
						<div className="statCell playerName">
							<AutoSizedText maxFontSize={56}>
								{stat.name}
							</AutoSizedText>
						</div>
						<div className="statCell currentScore">
							<AutoSizedText maxFontSize={36}>
								{stat.currentScore !== undefined ? stat.currentScore : ' '}
							</AutoSizedText>
						</div>
						<div className="statCell">
							<AutoSizedText maxFontSize={36} className="rightCount">
								{stat.rightTotal}
							</AutoSizedText>
						</div>
						<div className="statCell">
							<AutoSizedText maxFontSize={36} className="wrongCount">
								{stat.wrongTotal}
							</AutoSizedText>
						</div>
						<div className="statCell rightAnswers">
							<AutoSizedText maxFontSize={36} className="rightCount">
								{stat.rightAnswerCount}
							</AutoSizedText>
						</div>
						<div className="statCell wrongAnswers">
							<AutoSizedText maxFontSize={36} className="wrongCount">
								{stat.wrongAnswerCount}
							</AutoSizedText>
						</div>
					</div>
				))}
			</div>

			<div className="statisticsFooter">{localization.tableLogoAuthor}</div>
		</div>
	);
}
