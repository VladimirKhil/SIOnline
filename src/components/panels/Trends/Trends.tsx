import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import State from '../../../state/State';
import GamesResponse from 'sistatistics-client/dist/models/GamesResponse';
import PackagesStatistic from 'sistatistics-client/dist/models/PackagesStatistic';
import GamesStatistic from 'sistatistics-client/dist/models/GamesStatistic';
import localization from '../../../model/resources/localization';
import Link from '../../common/Link';
import Constants from '../../../model/enums/Constants';
import clearUrls from '../../../utils/clearUrls';

import './Trends.css';

interface TrendsProps {
	latestGames?: GamesResponse;
	gamesStatistics?: GamesStatistic;
	packagesStatistics?: PackagesStatistic;
	clearUrls?: boolean;
}

const mapStateToProps: MapStateToProps<TrendsProps, unknown, State> = (state: State) => ({
	latestGames: state.online.latestGames,
	gamesStatistics: state.online.gamesStatistics,
	packagesStatistics: state.online.packagesStatistics,
	clearUrls: state.common.clearUrls,
});

function print(value: Record<string, number>): JSX.Element[] {
	return Object.entries(value).map(e => <div className='property'><div>{e[0]}</div><div>{e[1]}</div></div>);
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
					{props.packagesStatistics.packages.filter(p => p.package.name !== Constants.RANDOM_PACKAGE).map(
						(p, i) => <div key={i} className='trendPackage'>
							<div><span className='packageName'>
								{props.clearUrls ? clearUrls(p.package.name) : p.package.name}</span>
							</div>

							<div className='property'>
								<div>{localization.games}</div>
								<div>{p.gameCount}</div>
							</div>

							<div className='property'>
								<div>{localization.packageAuthor}</div>

								<div>
									<span className='packageAuthors'>
									{isValidLink(p.package.authorsContacts)
										? <Link href={p.package.authorsContacts} target='_blank' rel='noopener noreferrer'>{p.package.authors}</Link>
										: <span
											title={props.clearUrls ? undefined : p.package.authorsContacts}
											className={p.package.authorsContacts && p.package.authorsContacts.length > 0 ? 'hasContact' : ''}>
											{p.package.authors}
										</span>}
									</span>
								</div>
							</div>
						</div>)}
					</div>
				: null}

			{props.gamesStatistics
				? <div>
					<div className='trendCategory'>{localization.gamesStatistics}</div>
					<div><span>{localization.gameCount}</span>: {props.gamesStatistics.gameCount}</div>
				</div>
				: null}

			{props.latestGames
				? <div>
					<div className='trendCategory'>{localization.latestGames}</div>
					{props.latestGames.results.map((g, i) => <div key={i} className='trendGame'>
						<div className='gameName'>{g.name}</div>
						<div>{print(g.results)}</div>
						{Object.keys(g.reviews).length > 0 ? <div>{localization.reviews}: {print(g.reviews)}</div> : null}
					</div>)}
				</div>
				: null}
		</div>
	);
}

export default connect(mapStateToProps)(Trends);
