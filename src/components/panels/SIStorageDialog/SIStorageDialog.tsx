import * as React from 'react';
import { connect } from 'react-redux';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import CompareMode from 'sistorage-client/dist/models/CompareMode';
import Restriction from 'sistorage-client/dist/models/Restriction';
import PackageSortMode from 'sistorage-client/dist/models/PackageSortMode';
import PackageSortDirection from 'sistorage-client/dist/models/PackageSortDirection';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';
import PackageFilters from 'sistorage-client/dist/models/PackageFilters';
import PackageSelectionParameters from 'sistorage-client/dist/models/PackageSelectionParameters';
import { keys, sortRecord } from '../../../utils/RecordExtensions';
import { getFullCulture } from '../../../utils/StateHelpers';
import { useAppDispatch } from '../../../state/hooks';
import SIStoragePackage from '../SIStoragePackage/SIStoragePackage';

import {
	receiveAuthors,
	receiveLanguages,
	receivePublishers,
	receiveRestrictions,
	receiveTags,
	searchPackages } from '../../../state/siPackagesSlice';

import './SIStorageDialog.scss';

const PAGE_SIZE = 20;

interface StateProps {
	packages: PackagesPage;
	tags: Record<number, string>;
	publishers: Record<number, string>;
	authors: Record<number, string>;
	languages: Record<number, string>;
	restrictions: Record<number, Restriction>;
	isLoading: boolean;
	error: string | null;
	culture: string;
	languageId?: number;
	clearUrls?: boolean;
}

interface OwnProps {
	onClose: () => void;
	onSelect: (id: string, name: string, uri: string) => void;
}

interface SIStorageDialogProps extends OwnProps, StateProps {}

const mapStateToProps = (state: State): StateProps => ({
	packages: state.siPackages.packages,
	isLoading: state.siPackages.isLoading,
	authors: state.siPackages.authors,
	publishers: state.siPackages.publishers,
	tags: state.siPackages.tags,
	languages: state.siPackages.languages,
	restrictions: state.siPackages.restrictions,
	error: state.siPackages.error,
	culture: getFullCulture(state),
	languageId: state.siPackages.languageId,
	clearUrls: state.common.clearUrls,
});

const SIStorageDialog: React.FC<SIStorageDialogProps> = (props) => {
	const [filters, setFilters] = React.useState<PackageFilters>({
		restrictionIds: [-1],
		difficulty: {
			compareMode: CompareMode.GreaterThan | CompareMode.EqualTo,
			value: 1
		},
	});

	const [selectionParameters, setSelectionParameters] = React.useState<PackageSelectionParameters>({
		sortDirection: PackageSortDirection.Ascending,
		sortMode: PackageSortMode.Name,
		from: 0,
		count: PAGE_SIZE,
	});

	const [pageIndex, setPageIndex] = React.useState(0);

	const appDispatch = useAppDispatch();

	React.useEffect(() => {
		appDispatch(receiveLanguages());
	}, []);

	const onLanguageLoaded = () => {
		appDispatch(searchPackages({ filters, selectionParameters }));
		appDispatch(receiveAuthors());
		appDispatch(receivePublishers());
		appDispatch(receiveTags());
		appDispatch(receiveRestrictions());
	};

	React.useEffect(() => {
		if (props.languageId !== undefined) {
			onLanguageLoaded();
		}
	}, [props.languageId]);

	const onTagIdChanged = (value: string) => {
		const tagId = parseInt(value, 10);
		setFilters({
			...filters,
			tagIds: isNaN(tagId) ? undefined : [tagId]
		});
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
		setFilters({
			...filters,
			searchText: value,
		});
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
		appDispatch(searchPackages({
			filters,
			selectionParameters:{
				sortDirection: selectionParameters.sortDirection,
				sortMode: selectionParameters.sortMode,
				from: pageIndex * PAGE_SIZE,
				count: selectionParameters.count,
			}
		}));
	};

	React.useEffect(() => {
		runSearchPackages();
	}, [filters, selectionParameters, pageIndex]);

	const filterTagIds = filters.tagIds;
	const filterRestrictionIds = filters.restrictionIds;
	const tagId = filterTagIds && filterTagIds.length > 0 ? filterTagIds[0] : -2;
	const restrictionId = filterRestrictionIds && filterRestrictionIds.length > 0 ? filterRestrictionIds[0] : -2;

	const packageLength = props.packages.packages.length;
	const pageCount = packageLength === 0 ? 0 : Math.ceil(props.packages.total / PAGE_SIZE);

	const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

	return (
		<Dialog className="siStorageDialog" title={localization.libraryTitle} onClose={props.onClose}>
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
					<div className="filter">
						<div className="selectorName">{localization.packageSubject}</div>

						<select aria-label='tag filter' className="selector" value={tagId} onChange={e => onTagIdChanged(e.target.value)}>
							<option key={undefined} value={undefined}>
								{localization.librarySearchAll}
							</option>

							<option key={-1} value={-1}>
								{localization.librarySearchNotSet}
							</option>

							{sortRecord(props.tags).map(({ id, value }) => (
								<option key={id} value={id}>
									{value}
								</option>
							))}
						</select>
					</div>


					<div className="filter">
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

					<div className="filter">
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

							{sortRecord(props.publishers).map(({ id, value }) => (
								<option key={id} value={id}>
									{value}
								</option>
							))}
						</select>
					</div>

					<div className="filter">
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

							{sortRecord(props.authors).map(({ id, value }) => (
								<option key={id} value={id}>
									{value}
								</option>
							))}
						</select>
					</div>

					{props.clearUrls ? null : <div className="filter">
						<div className="selectorName">{localization.packageRestriction}</div>

						<select
							aria-label='restriction filter'
							className="selector"
							value={restrictionId}
							onChange={e => onRestrictionIdChanged(e.target.value)}>
							<option key={undefined} value={undefined}>{localization.librarySearchAll}</option>
							<option key={-1} value={-1}>{localization.librarySearchNotSet}</option>

							{keys(props.restrictions).map((id) => (
								<option key={id} value={id}>
									{props.restrictions[id].value}
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
					<h2>{`${localization.packages} (${props.packages.total})`}</h2>
					{props.error != null ? <div className='sistorage_error'>{props.error}</div> : null}
					{props.isLoading && <span className='loading'>{localization.loading}</span>}
				</div>

				<div className='pagination'>
					<span className='header'>{localization.page}:</span>
					{pages.map(i => (
						<div
							key={i}
							className={`page ${pageIndex === i - 1 ? 'active' : 'inactive'}`}
							onClick={() => setPageIndex(i - 1)}>
							{i}
						</div>
					))}
				</div>

				<ul className='packages'>
					{props.packages.packages.map((p) => <SIStoragePackage
						key={p.id}
						package={p}
						authors={props.authors}
						restrictions={props.restrictions}
						culture={props.culture}
						tags={props.tags}
						publishers={props.publishers}
						onSelect={props.onSelect} />)}
				</ul>
			</div>
		</Dialog>
	);
};

export default connect(mapStateToProps)(SIStorageDialog);
