import React from 'react';
import Package from 'sistorage-client/dist/models/Package';
import localization from '../../../model/resources/localization';

import './SIStoragePackage.scss';
import defaultLogo from '../../../../assets/images/qlogo.png';
import FlyoutButton from '../../common/FlyoutButton/FlyoutButton';

interface SIStoragePackageProps {
	package: Package;
	authors: { [id: string]: string };
	publishers: { [id: string]: string };
	restrictions: { [id: string]: { value: string } };
	tags: { [id: string]: string };
	culture: string;
	onSelect: (id: string, name: string, uri: string) => void;
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
		size,
		rounds,
		questionCount,
		contentTypeStatistic,
		downloadCount,
		logoUri,
	} = props.package;

	const publisher = publisherId ? props.publishers[publisherId] : '';

	return <li className='storagePackage'>
		<header>
			<img src={logoUri ?? defaultLogo} alt='logo' className='storagePackageLogo' />

			<div className='storagePackageInfo'>
				<div className="storagePackageName">{name}</div>

				<div className="breakable">
					{authorIds?.map(a => <div key={a} className='packageItemValue'>{props.authors[a]}</div>)}
				</div>
			</div>
		</header>

		<main>
			{tagIds && tagIds.length > 0
				? <div>
					<span className='packageItemHeader'>{`${localization.packageSubject}: `}</span>
					<span>{tagIds?.map(t => <div key={t} className='packageItemValue'>{props.tags[t]}</div>)}</span>
				</div>
				: null}

			{publisher && publisher.length > 0
				? <div>
					<span className='packageItemHeader'>{`${localization.packagePublisher}: `}</span>
					<span>{publisher}</span>
				</div>
				: null}

			{restrictionIds && restrictionIds.length > 0
				? <div>
					<span className='packageItemHeader'>{`${localization.packageRestriction}: `}</span>

					<span className="breakable">
						{restrictionIds?.map(r => <div key={r} className='packageItemValue'>
							{props.restrictions[r]?.value}
						</div>)}
					</span>
				</div>
				: null}

			<div>{createDate ? new Date(createDate).toLocaleDateString(props.culture) : ''}</div>
			{size ? <div title={localization.size}>{Math.round(size / 1024 / 1024 * 100) / 100} MB</div> : null}
			<div title={localization.packageDifficulty}>🎓{difficulty}</div>
			<div title={localization.downloadCount}>⬇️{downloadCount}</div>
		</main>

		<div className="selectButton">
			<FlyoutButton className='info-button standard' flyout={
				<div className='package-info'>
					<div>
						<span className='packageItemHeader'>{`${localization.questionCount}: `}</span>
						<span>{questionCount}</span>
					</div>

					{contentTypeStatistic ? (<div>
						<span className='packageItemHeader'>{`${localization.content}: `}</span>

						<span>{Object.keys(contentTypeStatistic).map(
							key => `${getContentName(key)} (${contentTypeStatistic[key]})`).join(', ')}
						</span>
					</div>) : null}

					<span className='packageItemHeader'>{`${localization.roundsAndThemes}: `}</span>

					<ul className='rounds'>{rounds?.map((r, i) => <li key={i} className='roundInfo'>
							<span className='roundName'>{r.name}</span>: {r.themeNames.join(', ')}
						</li>)}
					</ul>
				</div>
			}>
				{localization.info}
			</FlyoutButton>

			{contentUri ? <button
				type="button"
				className='standard'
				onClick={() => props.onSelect(id, name ?? '', contentUri)}>
				{localization.librarySelect}
			</button> : null}
		</div>
	</li>;
};

export default SIStoragePackage;