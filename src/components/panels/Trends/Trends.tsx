import * as React from 'react';
import localization from '../../../model/resources/localization';
import Link from '../../common/Link/Link';
import Constants from '../../../model/enums/Constants';
import clearUrls from '../../../utils/clearUrls';
import { useAppSelector } from '../../../state/new/hooks';

import './Trends.css';

function print(value: Record<string, number>): JSX.Element[] {
	return Object.entries(value).map((e, i) => <div key={i} className='property'><div>{e[0]}</div><div>{e[1]}</div></div>);
}

function isValidLink(link: string) {
	return link.startsWith('https://vk.com/') ||
		link.startsWith('https://t.me/') ||
		link.startsWith('https://discord.com/') ||
		link.startsWith('https://discord.gg/') ||
		link.startsWith('https://www.twitch.tv/');
}

export default function Trends(): JSX.Element {
	const common = useAppSelector(state => state.common);
	const online = useAppSelector(state => state.online2);

	return (
		<div className="trends">
			{online.packagesStatistics
				? <div>
					<div className='trendCategory'>{localization.topPackages}</div>
					{online.packagesStatistics.packages.filter(p => p.package.name !== Constants.RANDOM_PACKAGE).map(
						(p, i) => <div key={i} className='trendPackage'>
							<div><span className='packageName'>
								{common.clearUrls ? clearUrls(p.package.name) : p.package.name}</span>
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
											title={common.clearUrls ? undefined : p.package.authorsContacts}
											className={p.package.authorsContacts && p.package.authorsContacts.length > 0 ? 'hasContact' : ''}>
											{p.package.authors}
										</span>}
									</span>
								</div>
							</div>
						</div>)}
					</div>
				: null}

			{online.gamesStatistics
				? <div>
					<div className='trendCategory'>{localization.gamesStatistics}</div>
					<div><span>{localization.gameCount}</span>: {online.gamesStatistics.gameCount}</div>
				</div>
				: null}

			{online.latestGames
				? <div>
					<div className='trendCategory'>{localization.latestGames}</div>
					{online.latestGames.results.map((g, i) => <div key={i} className='trendGame'>
						<div className='gameName'>{g.name}</div>
						<div>{print(g.results)}</div>
						{Object.keys(g.reviews).length > 0 ? <div>{localization.reviews}: {print(g.reviews)}</div> : null}
					</div>)}
				</div>
				: null}
		</div>
	);
}
