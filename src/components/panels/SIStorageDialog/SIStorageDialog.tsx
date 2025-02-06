import * as React from 'react';
import { connect } from 'react-redux';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import CompareMode from 'sistorage-client/dist/models/CompareMode';
import PackageSortMode from 'sistorage-client/dist/models/PackageSortMode';
import PackageSortDirection from 'sistorage-client/dist/models/PackageSortDirection';
import PackageFilters from 'sistorage-client/dist/models/PackageFilters';
import PackageValueFilters from 'sistorage-client/dist/models/PackageValueFilters';
import PackageSelectionParameters from 'sistorage-client/dist/models/PackageSelectionParameters';
import { keys, sortRecord } from '../../../utils/RecordExtensions';
import { getFullCulture } from '../../../utils/StateHelpers';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import SIStoragePackage from '../SIStoragePackage/SIStoragePackage';
import getVisiblePageNumbers from '../../../utils/getVisiblePageNumbers';
import { trimLength } from '../../../utils/StringHelpers';
import { djb2Hash } from '../../../utils/djb2Hash';

import { receiveAuthors,
	receiveFilters,
	receiveLanguages,
	receivePublishers,
	receiveRestrictions,
	receiveTags,
	searchPackages,
	searchPackagesByValueFilters
} from '../../../state/siPackagesSlice';

import './SIStorageDialog.scss';

interface StateProps {
	culture: string;
}

interface OwnProps {
	onClose: () => void;
	onSelect: (id: string, name: string, uri: string) => void;
}

interface SIStorageDialogProps extends OwnProps, StateProps {}

const mapStateToProps = (state: State): StateProps => ({
	culture: getFullCulture(state),
});

const SIStorageDialog: React.FC<SIStorageDialogProps> = (props) => {
	const siPackages = useAppSelector(state => state.siPackages);
	const storage = siPackages.storages[siPackages.storageIndex];
	const common = useAppSelector(state => state.common);
	const { clearUrls } = common;

	const [filters, setFilters] = React.useState<PackageFilters>({
		restrictionIds: [-1],
		difficulty: {
			compareMode: CompareMode.GreaterThan | CompareMode.EqualTo,
			value: 1
		},
	});

	const [valueFilters, setValueFilters] = React.useState<PackageValueFilters>({
		difficulty: {
			compareMode: CompareMode.GreaterThan | CompareMode.EqualTo,
			value: 1
		},
	});

	const [selectionParameters, setSelectionParameters] = React.useState<PackageSelectionParameters>({
		sortDirection: PackageSortDirection.Descending,
		sortMode: PackageSortMode.CreatedDate,
		from: 0,
		count: storage.maximumPageSize,
	});

	const [pageIndex, setPageIndex] = React.useState(0);

	const appDispatch = useAppDispatch();

	React.useEffect(() => {
		appDispatch(receiveFilters());
		appDispatch(receiveLanguages());
	}, []);

	const onLanguageLoaded = () => {
		if (storage.identifiersSupported) {
			appDispatch(searchPackages({ filters, selectionParameters }));
		} else {
			appDispatch(searchPackagesByValueFilters({ valueFilters, selectionParameters }));
		}

		appDispatch(receiveAuthors());
		appDispatch(receivePublishers());
		appDispatch(receiveTags());
		appDispatch(receiveRestrictions());
	};

	React.useEffect(() => {
		if (siPackages.languageId !== undefined) {
			onLanguageLoaded();
		}
	}, [siPackages.languageId]);

	const onTagIdChanged = (value: string) => {
		const tagId = parseInt(value, 10);

		if (storage.identifiersSupported) {
			setFilters({
				...filters,
				tagIds: isNaN(tagId) ? undefined : [tagId]
			});
		} else {
			setValueFilters({
				...valueFilters,
				tags: isNaN(tagId) ? undefined : [siPackages.tags[tagId]]
			});
		}

		setPageIndex(0);
	};

	const onDifficultyCompareModeChanged = (value: string) => {
		const compareMode = parseInt(value, 10) as CompareMode;
		setFilters({
			...filters,
			difficulty: {
				value: filters.difficulty?.value ?? 1,
				compareMode: compareMode
			}
		});
		setPageIndex(0);
	};

	const onDifficultyValueChanged = (value: string) => {
		const difficultyValue = parseInt(value, 10);
		setFilters({
			...filters,
			difficulty: {
				value: difficultyValue,
				compareMode: filters.difficulty?.compareMode ?? CompareMode.GreaterThan | CompareMode.EqualTo,
			}
		});
		setPageIndex(0);
	};

	const onPublisherIdChanged = (value: string) => {
		const publisherId = parseInt(value, 10);
		setFilters({
			...filters,
			publisherId: publisherId,
		});
		setPageIndex(0);
	};

	const onAuthorIdChanged = (value: string) => {
		const authorId = parseInt(value, 10);
		setFilters({
			...filters,
			authorId: authorId,
		});
		setPageIndex(0);
	};

	const onRestrictionIdChanged = (value: string) => {
		const restrictionId = parseInt(value, 10);
		setFilters({
			...filters,
			restrictionIds: isNaN(restrictionId) ? undefined : [restrictionId],
		});
		setPageIndex(0);
	};

	const onTextChanged = (value: string) => {
		if (storage.identifiersSupported) {
			setFilters({
				...filters,
				searchText: value,
			});
		} else {
			setValueFilters({
				...valueFilters,
				searchText: value,
			});
		}

		setPageIndex(0);
	};

	const onSortModeChanged = (value: string) => {
		const sortMode = parseInt(value, 10) as PackageSortMode;
		setSelectionParameters({
			...selectionParameters,
			sortMode: sortMode,
		});
		setPageIndex(0);
	};

	const onSortDirectionChanged = (value: string) => {
		const sortDirection = parseInt(value, 10) as PackageSortDirection;
		setSelectionParameters({
			...selectionParameters,
			sortDirection: sortDirection,
		});
		setPageIndex(0);
	};

	const runSearchPackages = () => {
		if (storage.identifiersSupported) {
			appDispatch(searchPackages({
				filters,
				selectionParameters:{
					sortDirection: selectionParameters.sortDirection,
					sortMode: selectionParameters.sortMode,
					from: pageIndex * storage.maximumPageSize,
					count: selectionParameters.count,
				}
			}));
		} else {
			appDispatch(searchPackagesByValueFilters({
				valueFilters,
				selectionParameters:{
					sortDirection: selectionParameters.sortDirection,
					sortMode: selectionParameters.sortMode,
					from: pageIndex * storage.maximumPageSize,
					count: selectionParameters.count,
				}
			}));
		}
	};

	React.useEffect(() => {
		// Debounce search
		const handler = setTimeout(() => {
			runSearchPackages();
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [filters, valueFilters, selectionParameters, pageIndex]);

	let tagId: number;

	if (storage.identifiersSupported) {
		const filterTagIds = filters.tagIds;
		tagId = filterTagIds && filterTagIds.length > 0 ? filterTagIds[0] : -2;
	} else {
		const filterTags = valueFilters.tags;

		if (filterTags && filterTags.length > 0) {
			const [tag] = filterTags;
			const indexStr = Object.entries(siPackages.tags).find(([_, value]) => value === tag)?.[0];
			tagId = indexStr ? parseInt(indexStr, 10) : -2;
		} else {
			tagId = -2;
		}
	}

	const filterRestrictionIds = filters.restrictionIds;
	const restrictionId = filterRestrictionIds && filterRestrictionIds.length > 0 ? filterRestrictionIds[0] : -2;

	const packageLength = siPackages.packages.packages.length;
	const pageCount = packageLength === 0 ? 0 : Math.ceil(siPackages.packages.total / storage.maximumPageSize);

	const pages = getVisiblePageNumbers(pageIndex, pageCount);

	return (
		<Dialog className="siStorageDialog" title={storage.name} onClose={props.onClose}>
			{!clearUrls && storage.uri
				? <button
					type='button'
					className='standard storage__open'
					onClick={() => window.open(storage.uri, '_blank')}>
						{localization.openLibrary}
					</button>
				: null}

			<div className='disclaimer'>{localization.siStorageDisclaimer}</div>

			<div className="container">
				<div className='search'>
					<input
						aria-label='text filter'
						className="textFilter"
						type="text"
						value={filters.searchText}
						placeholder={localization.search}
						onChange={e => onTextChanged(e.target.value)} />
				</div>

				<div className="filters">
					{storage.facets.includes('tags')
						? <div className="filter">
							<div className="selectorName">{localization.packageSubject}</div>

							<select aria-label='tag filter' className="selector" value={tagId} onChange={e => onTagIdChanged(e.target.value)}>
								<option key={undefined} value={undefined}>
									{localization.librarySearchAll}
								</option>

								<option key={-1} value={-1}>
									{localization.librarySearchNotSet}
								</option>

								{sortRecord(siPackages.tags).filter(({ value }) => !siPackages.filter.tags
									.includes(djb2Hash(value).toString()))
									.map(({ id, value }) => (
									<option key={id} value={id}>
										{trimLength(value, 100)}
									</option>
								))}
							</select>
						</div>
						: null}

					{storage.facets.includes('difficulty')
						? <div className="filter">
							<div className="selectorName">{localization.packageDifficulty}</div>

							<div className="selectorsGroup">
								<select
									aria-label='difficulty relation filter'
									className="selectorDifRel"
									value={filters.difficulty?.compareMode}
									onChange={e => onDifficultyCompareModeChanged(e.target.value)}
								>
									<option value={CompareMode.GreaterThan | CompareMode.EqualTo}>{localization.librarySearchMoreOrEqual}</option>
									<option value={CompareMode.LessThan | CompareMode.EqualTo}>{localization.librarySearchLessOrEqual}</option>
								</select>

								<select
									aria-label='difficulty value filter'
									className="selectorDif"
									value={filters.difficulty?.value}
									onChange={e => onDifficultyValueChanged(e.target.value)}
								>
									{Array.from({ length: 10 })
										.map((_, i) => i + 1)
										.map((el) => (
											<option key={el} value={el}>
												{el}
											</option>
										))}
								</select>
							</div>
						</div>
						: null}

					{storage.facets.includes('publishers')
						? <div className="filter">
							<div className="selectorName">{localization.packagePublisher}</div>

							<select
								aria-label='publisher filter'
								className="selector"
								value={filters.publisherId}
								onChange={e => onPublisherIdChanged(e.target.value)}
							>
								<option key={undefined} value={undefined}>
									{localization.librarySearchAll}
								</option>

								<option key={-1} value={-1}>
									{localization.librarySearchNotSet}
								</option>

								{sortRecord(siPackages.publishers).map(({ id, value }) => (
									<option key={id} value={id}>
										{value}
									</option>
								))}
							</select>
						</div>
						: null}

					{storage.facets.includes('authors')
						? <div className="filter">
							<div className="selectorName">{localization.packageAuthor}</div>

							<select
								aria-label='author filter'
								className="selector"
								value={filters.authorId}
								onChange={e => onAuthorIdChanged(e.target.value)}
							>
								<option key={undefined} value={undefined}>
									{localization.librarySearchAll}
								</option>

								{sortRecord(siPackages.authors).map(({ id, value }) => (
									<option key={id} value={id}>
										{value}
									</option>
								))}
							</select>
						</div>
						: null}

					{clearUrls || !storage.facets.includes('restrictions') ? null : <div className="filter">
						<div className="selectorName">{localization.packageRestriction}</div>

						<select
							aria-label='restriction filter'
							className="selector"
							value={restrictionId}
							onChange={e => onRestrictionIdChanged(e.target.value)}>
							<option key={undefined} value={undefined}>{localization.librarySearchAll}</option>
							<option key={-1} value={-1}>{localization.librarySearchNotSet}</option>

							{keys(siPackages.restrictions).map((id) => (
								<option key={id} value={id}>
									{siPackages.restrictions[id].value}
								</option>
							))}
						</select>
					</div>}

					<div className="filter">
						<div className="selectorName">{localization.sort}</div>

						<div className="selectorsGroup">
							<select
								aria-label='sort mode'
								className="selectorSortMode"
								value={selectionParameters.sortMode}
								onChange={e => onSortModeChanged(e.target.value)}
							>
								<option value={PackageSortMode.Name}>{localization.name}</option>
								<option value={PackageSortMode.CreatedDate}>{localization.packagePublishedDate}</option>
							</select>

							<select
								aria-label='sort direction'
								className="selectorSortDir"
								value={selectionParameters.sortDirection}
								onChange={e => onSortDirectionChanged(e.target.value)}
							>
								<option value={PackageSortDirection.Descending}>{localization.descending}</option>
								<option value={PackageSortDirection.Ascending}>{localization.ascending}</option>
							</select>
						</div>
					</div>
				</div>

				<div className='packagesHeader'>
					<h2>{`${localization.packages} (${siPackages.packages.total})`}</h2>
					{siPackages.error != null ? <div className='sistorage_error'>{siPackages.error}</div> : null}
					{siPackages.isLoading && <span className='loading'>{localization.loading}</span>}
				</div>

				{pages.length > 0
					? <div className='pagination'>
						<span className='header'>{localization.page}:</span>

						{pages.map((i, index) => (
							typeof i === 'string'
								? <span key={index < 4 ? -1 : -2} className='page'>{i}</span>
								: <div
									key={i}
									className={`page ${pageIndex === i ? 'active' : 'inactive'}`}
									onClick={() => setPageIndex(i)}>
									{i + 1}
								</div>
						))}
					</div>
					: null}

				<ul className='packages'>
					{siPackages.packages.packages.map(
						(p) => siPackages.filter.packages[parseInt(p.id, 10)] === 0
						? <li key={p.id} className='blocked'>{localization.blocked}</li>
						: <SIStoragePackage
							key={p.id}
							package={p}
							authors={siPackages.authors}
							restrictions={siPackages.restrictions}
							culture={props.culture}
							tags={siPackages.tags}
							publishers={siPackages.publishers}
							storage={storage}
							onSelect={props.onSelect} />)}
				</ul>
			</div>
		</Dialog>
	);
};

export default connect(mapStateToProps)(SIStorageDialog);
