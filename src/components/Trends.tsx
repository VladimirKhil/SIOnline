import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import State from '../state/State';
import GamesResponse from 'sistatistics-client/dist/models/GamesResponse';
import PackagesStatistic from 'sistatistics-client/dist/models/PackagesStatistic';
import GamesStatistic from 'sistatistics-client/dist/models/GamesStatistic';
import localization from '../model/resources/localization';

import './Trends.css';

interface TrendsProps {
	latestGames?: GamesResponse;
	gamesStatistics?: GamesStatistic;
	packagesStatistics?: PackagesStatistic;
}

const mapStateToProps: MapStateToProps<TrendsProps, unknown, State> = (state: State) => ({
	latestGames: state.online.latestGames,
	gamesStatistics: state.online.gamesStatistics,
	packagesStatistics: state.online.packagesStatistics,
});

function print(value: any) {
	return Object.entries(value).map(e => `${e[0]}: ${e[1]}`).join(', ');
}

function isValidLink(link: string) {
	return link.startsWith('https://vk.com/') ||
		link.startsWith('https://t.me/') ||
		link.startsWith('https://discord.com/') ||
		link.startsWith('https://discord.gg/') ||
		link.startsWith('https://www.twitch.tv/');
}

export function Trends(props: TrendsProps): JSX.Element {
	return (
		<div className="trends">
			{props.packagesStatistics
				? <div>
					<div className='trendCategory'>{localization.topPackages}</div>
					{props.packagesStatistics.packages.map(
						(p, i) => <div key={i} className='trendPackage'>
							<div><span className='packageName'>{p.package.name}</span> ({localization.ofGames}: {p.gameCount})</div>
							<div>{localization.by} <span className='packageAuthors'>
								{isValidLink(p.package.authorsContacts)
									? <a href={p.package.authorsContacts} target='_blank' rel='noopener noreferrer'>{p.package.authors}</a>
									: <span
										title={p.package.authorsContacts}
										className={p.package.authorsContacts && p.package.authorsContacts.length > 0 ? 'hasContact' : ''}>
										{p.package.authors}
									</span>}
							</span></div>
						</div>)}
					</div>
				: null}

			{props.gamesStatistics
				? <div>
					<div className='trendCategory'>{localization.gamesStatistics}</div>
					<div><span>{localization.gameCount}</span>: {props.gamesStatistics.gameCount}</div>
					{/* <div><span>{localization.gameDuration}</span>: {props.gamesStatistics.totalDuration}</div> */}
				</div>
				: null}

			{props.latestGames
				? <div>
					<div className='trendCategory'>{localization.latestGames}</div>
					{props.latestGames.results.map((g, i) => <div key={i} className='trendGame'>
						<div className='gameName'>{g.name}</div>
						<div>{localization.results}: {print(g.results)}</div>
						{Object.keys(g.reviews).length > 0 ? <div>{localization.reviews}: {print(g.reviews)}</div> : null}
					</div>)}
				</div>
				: null}
		</div>
	);
}

export default connect(mapStateToProps)(Trends);
