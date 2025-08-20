import * as React from 'react';
import { useAppSelector } from '../../../state/hooks';
import PlayerStatistics from '../../../model/PlayerStatistics';
import localization from '../../../model/resources/localization';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';

import './TableStatistics.css';

export default function TableStatistics(): JSX.Element | null {
	const statistics = useAppSelector((state) => state.table.statistics);

	if (!statistics || statistics.length === 0) {
		return null;
	}

	return (
		<div className="tableStatistics">
			<div className="statisticsTable">
				<div className="statisticsTableHeader">
					<div className="statCell playerName">{localization.player}</div>
					<div className="statCell rightAnswers">{localization.rightAnswers}</div>
					<div className="statCell wrongAnswers">{localization.wrongAnswers}</div>
					<div className="statCell">{localization.scoreEarned}</div>
					<div className="statCell">{localization.scoreLost}</div>
				</div>

				{statistics.map((stat: PlayerStatistics, index: number) => (
					<div key={stat.name} className={`statisticsTableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
						<div className="statCell playerName">
							<AutoSizedText maxFontSize={56}>
								{stat.name}
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
					</div>
				))}
			</div>

			<div className="statisticsFooter">{localization.tableLogoAuthor}</div>
		</div>
	);
}
