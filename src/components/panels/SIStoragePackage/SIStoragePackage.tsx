import React from 'react';
import Package from 'sistorage-client/dist/models/Package';
import localization from '../../../model/resources/localization';
import SIStorageInfo from '../../../client/contracts/SIStorageInfo';

import './SIStoragePackage.scss';
import defaultLogo from '../../../../assets/images/qlogo.png';

interface SIStoragePackageProps {
	package: Package;
	authors: { [id: string]: string };
	publishers: { [id: string]: string };
	restrictions: { [id: string]: { value: string } };
	tags: { [id: string]: string };
	culture: string;
	storage: SIStorageInfo;
	onSelect: (id: string, name: string, uri: string, hostManaged: boolean) => void;
}

const getContentName = (contentKey: string) => {
	switch (contentKey) {
		case 'image':
			return localization.images;

		case 'audio':
			return localization.audio;

		case 'video':
			return localization.video;

		case 'html':
			return localization.html;

		default:
			return localization.text;
	}
};

const SIStoragePackage: React.FC<SIStoragePackageProps> = (props: SIStoragePackageProps) => {
	const [isExpanded, setIsExpanded] = React.useState(false);

	const {
		authorIds,
		name,
		difficulty,
		id,
		createDate,
		publisherId,
		restrictionIds,
		tagIds,
		contentUri,
		directContentUri,
		size,
		rounds,
		questionCount,
		contentTypeStatistic,
		downloadCount,
		logoUri,
	} = props.package;

	const publisher = publisherId ? props.publishers[publisherId] : '';

	let logo = defaultLogo;

	if (logoUri) {
		logo = logoUri.startsWith('http') ? logoUri : props.storage.uri + logoUri;
	}
	const content = contentUri ?? directContentUri;
	const hasDetails = !props.storage.limitedApi && (questionCount || contentTypeStatistic || rounds);

	   // Make the whole card clickable except the details button
	   const handleCardClick = (e: React.MouseEvent) => {
		   // Don't trigger select if clicking the details toggle
		   if ((e.target as HTMLElement).closest('.detailsToggle')) return;
		   if (content) props.onSelect(id, name ?? '', content, props.storage.limitedApi === true);
	   };

	   return <li
		   className={`storagePackage${isExpanded ? ' expanded' : ''}`}
		   tabIndex={content ? 0 : -1}
		   style={content ? { cursor: 'pointer' } : undefined}
		   onClick={handleCardClick}
		   onKeyDown={content ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(e as any); } : undefined}
	   >
		<header>
			{props.storage.packageProperties.includes('logo')
				? <img src={logo} alt='logo' className='storagePackageLogo' />
				: null}

			<div className='storagePackageInfo'>
				<div className="storagePackageName" title={name}>{name}</div>

				<div className="packageAuthors">
					{authorIds?.map(a => <span key={a} className='packageAuthorTag'>{props.authors[a]}</span>)}
				</div>
			</div>
		</header>

		<div className='packageMeta'>
			{tagIds && tagIds.length > 0
				? <div className='metaRow'>
					<span className='metaLabel'>{localization.packageSubject}:</span>
				<span className='metaValue'>{tagIds?.map(t => (<span key={t} className='metaTag'>{props.tags[t]}</span>))}</span>
				</div>
				: null}

			{publisher && publisher.length > 0
				? <div className='metaRow'>
					<span className='metaLabel'>{localization.packagePublisher}:</span>
					<span className='metaValue'>{publisher}</span>
				</div>
				: null}

			{restrictionIds && restrictionIds.length > 0
				? <div className='metaRow'>
					<span className='metaLabel'>{localization.packageRestriction}:</span>
					<span className='metaValue'>
						{restrictionIds?.map(r => (<span key={r} className='metaTag restriction'>{props.restrictions[r]?.value}</span>))}
					</span>
				</div>
				: null}
		</div>

		<div className='packageBadges'>
			{createDate
				? <span className='badge' title={localization.packagePublishedDate}>
					📅 {new Date(createDate).toLocaleDateString(props.culture)}
				</span>
				: null}

			{size
				? <span className='badge' title={localization.size}>
					📦 {Math.round(size / 1024 / 1024 * 100) / 100} MB
				</span>
				: null}

			{difficulty
				? <span className='badge' title={localization.packageDifficulty}>
					🎓 {difficulty}
				</span>
				: null}

			{questionCount
				? <span className='badge' title={localization.questionCount}>
					❓ {questionCount}
				</span>
				: null}

			{!props.storage.limitedApi
				? <span className='badge' title={localization.downloadCount}>
					⬇ {downloadCount}
				</span>
				: null}
		</div>

		{hasDetails
			? <div className={`packageDetails${isExpanded ? ' open' : ''}`}>
				<button
					type='button'
					className='detailsToggle'
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<span className='detailsToggleText'>{localization.info}</span>
					<span className={`detailsArrow${isExpanded ? ' up' : ''}`}>▾</span>
				</button>

				{isExpanded && <div className='detailsContent'>
					{contentTypeStatistic ? <div className='detailsRow'>
						<span className='metaLabel'>{localization.content}:</span>
						<span className='contentTags'>
						{Object.keys(contentTypeStatistic).map(key => (<span key={key} className='contentTag'>
							{getContentName(key)} ({contentTypeStatistic[key]})
						</span>))}
						</span>
					</div> : null}

					{rounds && rounds.length > 0 ? <div className='roundsSection'>
						<span className='metaLabel'>{localization.roundsAndThemes}:</span>
						<ul className='roundsList'>
							{rounds.map((r, i) => <li key={i} className='roundItem'>
								<span className='roundName'>{r.name}</span>
								<span className='roundThemes'>{r.themeNames.join(', ')}</span>
							</li>)}
						</ul>
					</div> : null}
				</div>}
			</div>
			: null}

		   {/* No select button, selection is by clicking the card */}
	</li>;
};

export default SIStoragePackage;