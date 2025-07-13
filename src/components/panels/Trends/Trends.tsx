import * as React from 'react';
import localization from '../../../model/resources/localization';
import Link from '../../common/Link/Link';
import Constants from '../../../model/enums/Constants';
import clearUrls from '../../../utils/clearUrls';
import { useAppSelector } from '../../../state/hooks';
import { trimLength } from '../../../utils/StringHelpers';
import TabControl from '../../common/TabControl/TabControl';

import './Trends.scss';

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

function isValidSourceForDownload(source?: string): boolean {
	return !!source &&
		source.length > 0 &&
		(source.startsWith('http://') || source.startsWith('https://'));
}

function downloadPackage(source: string, packageName: string): void {
	try {
		// Create a temporary anchor element to trigger download
		const link = document.createElement('a');
		link.href = source;

		// Sanitize the package name for use as filename
		const sanitizedName = packageName.replace(/[<>:"/\\|?*]/g, '_');
		link.download = `${sanitizedName}.siq`;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';

		// Append to document, click, and remove
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error('Failed to download package:', error);
		// Fallback: open in new tab
		window.open(source, '_blank', 'noopener,noreferrer');
	}
}

export default function Trends(): JSX.Element {
	const common = useAppSelector(state => state.common);
	const online = useAppSelector(state => state.online2);

	const [trendsMode, setTrendsMode] = React.useState(0);

	const getContent = () => {
		switch (trendsMode) {
			case 0:
				return online.packagesStatistics
				? <div>
					{online.packagesStatistics.packages
						.filter(p => p.package.name !== Constants.RANDOM_PACKAGE)
						.map((p, i) => {
							const trimmedPackageName = trimLength(p.package.name, 75);
							const trimmedAuthors = trimLength(p.package.authors.join(', '), 75);

							return <div key={i} className='trendPackage'>
								<div className='packageHeader'>
									<div><span className='packageName'>
										{common.clearUrls ? clearUrls(trimmedPackageName) : trimmedPackageName}</span>
									</div>

									{isValidSourceForDownload(p.package.source) && (
										<button
											type="button"
											className='downloadButton'
											onClick={() => downloadPackage(p.package.source || '', p.package.name)}
											title={localization.download}
											aria-label={localization.download}>
											⬇️
										</button>
									)}
								</div>

								<div className='property'>
									<div className='propertyHeader'>{localization.games}</div>
									<div className='propertyValue'>{p.gameCount}</div>
								</div>

								<div className='property'>
									<div className='propertyHeader'>{localization.packageAuthor}</div>

									<div className='propertyValue'>
										<span className='packageAuthors'>
										{isValidLink(p.package.authorsContacts)
											? <Link href={p.package.authorsContacts} target='_blank' rel='noopener noreferrer'>{trimmedAuthors}</Link>
											: <span
												title={common.clearUrls ? undefined : p.package.authorsContacts}
												className={p.package.authorsContacts && p.package.authorsContacts.length > 0 ? 'hasContact' : ''}>
												{trimmedAuthors}
											</span>}
										</span>
									</div>
								</div>
							</div>;
						})}
					</div>
				: null;

			case 1:
				return online.latestGames
				? <div>
					{online.latestGames.results.map((g, i) => <div key={i} className='trendGame'>
						<div className='gameName'>{g.name}</div>
						<div>{print(g.results)}</div>
						{Object.keys(g.reviews).length > 0 ? <div>{localization.reviews}: {print(g.reviews)}</div> : null}
					</div>)}
				</div>
				: null;

			default:
				return null;
		}
	};

	return (
		<div className="trends">
			<TabControl
				tabs={[
					{ id: 0, label: localization.topPackages },
					{ id: 1, label: localization.latestGames },
				]}
				activeTab={trendsMode}
				onTabClick={setTrendsMode} />

			{getContent()}
		</div>
	);
}
