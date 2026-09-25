import * as React from 'react';
import { useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import PersonName from '../../game/PlayerView/PersonName';

import './TableStatistics.css';


// Medals for top 3 players
const MedalIcon: React.FC<{ place: number }> = ({ place }) => {
	const colors: Record<number, { main: string; border: string; ribbon: string }> = {
		1: { main: '#E5A800', border: '#F5C226', ribbon: '#9A6700' },
		2: { main: '#B8C2CC', border: '#DCE2E8', ribbon: '#475569' },
		3: { main: '#A85824', border: '#C87742', ribbon: '#692e0c' },
	};

  const { main, border, ribbon } = colors[place] || {
    main: '#B8C2CC',
    border: '#DCE2E8',
    ribbon: '#64748B',
  };

  const ribbonPath = "M 9 14 L 9 44 L 14 41.5 L 19 44 L 19 14 Z";

  return (
    <svg
      className="medalSvg"
      viewBox="0 0 28 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={ribbonPath}
        fill={ribbon}
        transform="rotate(-18, 14, 14)"
      />
      <path
        d={ribbonPath}
        fill={ribbon}
        transform="rotate(18, 14, 14)"
      />
      <circle cx="14" cy="14" r="14" fill={border} />
      <circle cx="14" cy="14" r="11.5" fill={main} />
      <text
        x="14"
        y="14"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fontWeight="bold"
        fill="#000000"
      >
        {place}
      </text>
    </svg>
  );
};

export default function TableStatistics(): JSX.Element | null {
	const statistics = useAppSelector((state) => state.table.statistics);

	if (!statistics || statistics.length === 0) {
		return null;
	}

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

				{statistics.map((stat, index) => (
					<div key={stat.name} className={`statisticsTableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
						{index < 3 ? (
							<div className="statCell position medalCell">
								<AutoSizedText maxFontSize={56}>
									<MedalIcon place={index + 1} />
								</AutoSizedText>
							</div>
						) : (
							<div className="statCell position">
								<AutoSizedText maxFontSize={56}>
									{index + 1}
								</AutoSizedText>
							</div>
						)}

						<div className="statCell playerName">
							<AutoSizedText maxFontSize={56}>
								<PersonName name={stat.name} />
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
