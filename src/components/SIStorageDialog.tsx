import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Dialog from './common/Dialog';
import localization from '../model/resources/localization';
import State from '../state/State';
import siPackagesActionCreators from '../state/siPackages/siPackagesActionCreators';
import CompareMode from 'sistorage-client/dist/models/CompareMode';
import Restriction from 'sistorage-client/dist/models/Restriction';
import PackageSortMode from 'sistorage-client/dist/models/PackageSortMode';
import PackageSortDirection from 'sistorage-client/dist/models/PackageSortDirection';
import PackagesPage from 'sistorage-client/dist/models/PackagesPage';
import PackageFilters from 'sistorage-client/dist/models/PackageFilters';
import PackageSelectionParameters from 'sistorage-client/dist/models/PackageSelectionParameters';
import { keys, sortRecord } from '../utils/RecordExtensions';
import { getFullCulture } from '../utils/StateHelpers';

import './SIStorageDialog.css';

const PAGE_SIZE = 20;

interface DispatchProps {
	searchPackages: (filters: PackageFilters, selectionParameters: PackageSelectionParameters) => void;
	receiveAuthors: () => void;
	receiveTags: () => void;
	receivePublishers: () => void;
	receiveLanguages: () => void;
	receiveRestrictions: () => void;
}

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
}

interface OwnProps {
	onClose: () => void;
	onSelect: (id: string, name: string, uri: string) => void;
}

interface SIStorageDialogState {
	filters: PackageFilters;
	selectionParameters: PackageSelectionParameters;
	pageIndex: number;
}

interface SIStorageDialogProps extends OwnProps, StateProps, DispatchProps {}

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
});

const mapDispatchToProps = (dispatch: Dispatch<Action>): DispatchProps => ({
	searchPackages: (filters: PackageFilters, selectionParameters: PackageSelectionParameters) => {
		dispatch(siPackagesActionCreators.searchPackagesThunk(filters, selectionParameters) as unknown as Action);
	},
	receiveAuthors: () => {
		dispatch(siPackagesActionCreators.receiveAuthorsThunk() as unknown as Action);
	},
	receivePublishers: () => {
		dispatch(siPackagesActionCreators.receivePublishersThunk() as unknown as Action);
	},
	receiveTags: () => {
		dispatch(siPackagesActionCreators.receiveTagsThunk() as unknown as Action);
	},
	receiveLanguages: () => {
		dispatch(siPackagesActionCreators.receiveLanguagesThunk() as unknown as Action);
	},
	receiveRestrictions: () => {
		dispatch(siPackagesActionCreators.receiveRestrictionsThunk() as unknown as Action);
	}
});

export class SIStorageDialog extends React.Component<SIStorageDialogProps, SIStorageDialogState> {
	constructor(props: SIStorageDialogProps) {
		super(props);

		this.state = {
			filters: {
				difficulty: {
					compareMode: CompareMode.GreaterThan | CompareMode.EqualTo,
					value: 1
				},
			},
			selectionParameters: {
				sortDirection: PackageSortDirection.Ascending,
				sortMode: PackageSortMode.Name,
				from: 0,
				count: PAGE_SIZE,
			},
			pageIndex: 0,
		};
	}

	componentDidMount(): void {
		this.props.receiveLanguages();
	}

	onLanguageLoaded(): void {
		this.props.searchPackages(this.state.filters, this.state.selectionParameters);
		this.props.receiveAuthors();
		this.props.receivePublishers();
		this.props.receiveTags();
		this.props.receiveRestrictions();
	}

	private onTagIdChanged(value: string) {
		const tagId = parseInt(value, 10);

		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				tagIds: isNaN(tagId) ? undefined : [tagId]
			},
			pageIndex: 0,
		}));
	}

	private onDifficultyCompareModeChanged(value: string) {
		const compareMode = parseInt(value, 10) as CompareMode;

		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				difficulty: {
					value: state.filters.difficulty?.value ?? 1,
					compareMode: compareMode
				}
			},
			pageIndex: 0,
		}));
	}

	private onDifficultyValueChanged(value: string) {
		const difficultyValue = parseInt(value, 10);

		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				difficulty: {
					value: difficultyValue,
					compareMode: state.filters.difficulty?.compareMode ?? CompareMode.GreaterThan | CompareMode.EqualTo,
				}
			},
			pageIndex: 0,
		}));
	}

	private onPublisherIdChanged(value: string) {
		const publisherId = parseInt(value, 10);

		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				publisherId: publisherId,
			},
			pageIndex: 0,
		}));
	}

	private onAuthorIdChanged(value: string) {
		const authorId = parseInt(value, 10);

		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				authorId: authorId,
			},
			pageIndex: 0,
		}));
	}

	private onRestrictionIdChanged(value: string) {
		const restrictionId = parseInt(value, 10);

		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				restrictionIds: isNaN(restrictionId) ? undefined : [restrictionId],
			},
			pageIndex: 0,
		}));
	}

	private onTextChanged(value: string) {
		this.setState(state => ({
			...state,
			filters: {
				...state.filters,
				searchText: value,
			},
			pageIndex: 0,
		}));
	}

	private onSortModeChanged(value: string) {
		const sortMode = parseInt(value, 10) as PackageSortMode;

		this.setState(state => ({
			...state,
			selectionParameters: {
				...state.selectionParameters,
				sortMode: sortMode,
			},
			pageIndex: 0,
		}));
	}

	private onSortDirectionChanged(value: string) {
		const sortDirection = parseInt(value, 10) as PackageSortDirection;

		this.setState(state => ({
			...state,
			selectionParameters: {
				...state.selectionParameters,
				sortDirection: sortDirection,
			},
			pageIndex: 0,
		}));
	}

	componentDidUpdate(prevProps: SIStorageDialogProps, prevState: SIStorageDialogState) {
		if (this.state !== prevState) {
			this.searchPackages();
		}

		if (this.props.languageId !== prevProps.languageId) {
			this.onLanguageLoaded();
		}
	}

	searchPackages() {
		this.props.searchPackages(
			this.state.filters,
			{
				sortDirection: this.state.selectionParameters.sortDirection,
				sortMode: this.state.selectionParameters.sortMode,
				from: this.state.pageIndex * PAGE_SIZE,
				count: this.state.selectionParameters.count,
			}
		);
	}

	setPage(pageIndex: number) {
		this.setState({ pageIndex });
	}

	getContentName(contentKey: string) {
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
	}

	render(): JSX.Element {
		const filterTagIds = this.state.filters.tagIds;
		const filterRestrictionIds = this.state.filters.restrictionIds;
		const tagId = filterTagIds && filterTagIds.length > 0 ? filterTagIds[0] : -2;
		const restrictionId = filterRestrictionIds && filterRestrictionIds.length > 0 ? filterRestrictionIds[0] : -2;

		const packageLength = this.props.packages.packages.length;
		const pageCount = packageLength === 0 ? 0 : Math.ceil(this.props.packages.total / PAGE_SIZE);

		const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

		return (
			<Dialog id="siStorageDialog" title={localization.libraryTitle} onClose={this.props.onClose}>
				<div className="container">
					<div className="filters">
						<div>
							<span className="selectorName">{localization.packageSubject}</span>

							<select className="selector" value={tagId} onChange={e => this.onTagIdChanged(e.target.value)}>
								<option key={undefined} value={undefined}>
									{localization.librarySearchAll}
								</option>

								<option key={-1} value={-1}>
									{localization.librarySearchNotSet}
								</option>

								{sortRecord(this.props.tags).map(({ id, value }) => (
									<option key={id} value={id}>
										{value}
									</option>
								))}
							</select>
							<br />

							<span className="selectorName">{localization.packageDifficulty}</span>

							<div className="selectorsGroup">
								<select
									className="selectorDifRel"
									value={this.state.filters.difficulty?.compareMode}
									onChange={e => this.onDifficultyCompareModeChanged(e.target.value)}
								>
									<option value={CompareMode.GreaterThan | CompareMode.EqualTo}>{localization.librarySearchMoreOrEqual}</option>
									<option value={CompareMode.LessThan | CompareMode.EqualTo}>{localization.librarySearchLessOrEqual}</option>
								</select>

								<select
									className="selectorDif"
									value={this.state.filters.difficulty?.value}
									onChange={e => this.onDifficultyValueChanged(e.target.value)}
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

							<br />

							<span className="selectorName">{localization.packagePublisher}</span>

							<select
								className="selector"
								value={this.state.filters.publisherId}
								onChange={e => this.onPublisherIdChanged(e.target.value)}
							>
								<option key={undefined} value={undefined}>
									{localization.librarySearchAll}
								</option>

								<option key={-1} value={-1}>
									{localization.librarySearchNotSet}
								</option>

								{sortRecord(this.props.publishers).map(({ id, value }) => (
									<option key={id} value={id}>
										{value}
									</option>
								))}
							</select>

							<br />

							<span className="selectorName">{localization.packageAuthor}</span>

							<select
								className="selector"
								value={this.state.filters.authorId}
								onChange={e => this.onAuthorIdChanged(e.target.value)}
							>
								<option key={undefined} value={undefined}>
									{localization.librarySearchAll}
								</option>

								{sortRecord(this.props.authors).map(({ id, value }) => (
									<option key={id} value={id}>
										{value}
									</option>
								))}
							</select>
							<br />
						</div>

						<div>
							<span className="selectorName">{localization.packageRestriction}</span>

							<select className="selector" value={restrictionId} onChange={e => this.onRestrictionIdChanged(e.target.value)}>
								<option key={undefined} value={undefined}>{localization.librarySearchNotSet}</option>

								{keys(this.props.restrictions).map((id) => (
									<option key={id} value={id}>
										{this.props.restrictions[id].value}
									</option>
								))}
							</select>

							<br />
							<span className="selectorName">{localization.filter}</span>

							<input
								className="textFilter"
								type="text"
								value={this.state.filters.searchText}
								onChange={e => this.onTextChanged(e.target.value)} />

							<br />
							<span className="selectorName">{localization.sort}</span>

							<div className="selectorsGroup">
								<select
									className="selectorSortMode"
									value={this.state.selectionParameters.sortMode}
									onChange={e => this.onSortModeChanged(e.target.value)}
								>
									<option value={PackageSortMode.Name}>{localization.name}</option>
									<option value={PackageSortMode.CreatedDate}>{localization.packagePublishedDate}</option>
								</select>

								<select
									className="selectorSortDir"
									value={this.state.selectionParameters.sortDirection}
									onChange={e => this.onSortDirectionChanged(e.target.value)}
								>
									<option value={PackageSortDirection.Descending}>{localization.descending}</option>
									<option value={PackageSortDirection.Ascending}>{localization.ascending}</option>
								</select>
							</div>
						</div>
					</div>

					<div className='packagesHeader'>
						<h2>{`${localization.packages} (${this.props.packages.total})`}</h2>
						{this.props.error != null ? <div className='sistorage_error'>{this.props.error}</div> : null}
						{this.props.isLoading && <span className='loading'>{localization.loading}</span>}
					</div>

					<div className='pagination'>
						<span className='header'>{localization.page}:</span>

						{pages.map(i => (
							<div
								key={i}
								className={`page ${this.state.pageIndex === i - 1 ? 'active' : 'inactive'}`}
								onClick={() => this.setPage(i - 1)}>
								{i}
							</div>
						))}
					</div>

					<ul>
						{this.props.packages.packages.map(({
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
						}) => (
								<li key={id}>
									<span className="storagePackageName">{name}</span>
									<br />
									<span className='packageItemHeader'>{`${localization.packageSubject}: `}</span>
									<span>{tagIds?.map(t => <div key={t} className='packageItemValue'>{this.props.tags[t]}</div>)}</span>
									<br />
									<span className='packageItemHeader'>{`${localization.packageDifficulty}: `}</span>
									<span>{difficulty}</span>
									<br />
									<span className='packageItemHeader'>{`${localization.packagePublisher}: `}</span>
									<span>{publisherId ? this.props.publishers[publisherId] : ''}</span>
									<br />
									<span className='packageItemHeader'>{`${localization.packageAuthors}: `}</span>

									<span className="breakable">
										{authorIds?.map(a => <div key={a} className='packageItemValue'>{this.props.authors[a]}</div>)}
									</span>

									<br />
									<span className='packageItemHeader'>{`${localization.packageRestriction}: `}</span>

									<span className="breakable">
										{restrictionIds?.map(r => <div key={r} className='packageItemValue'>
											{this.props.restrictions[r]?.value}
										</div>)}
									</span>

									<br />
									<span className='packageItemHeader'>{`${localization.packagePublishedDate}: `}</span>
									<span>{createDate ? new Date(createDate).toLocaleDateString(this.props.culture) : ''}</span>

									{size
										? (<>
											<br />
											<span className='packageItemHeader'>{`${localization.size}: `}</span>
											<span>{Math.round(size / 1024 / 1024 * 100) / 100} MB</span>
											</>)
										: null}

									<br />
									<span className='packageItemHeader'>{`${localization.questionCount}: `}</span>
									<span>{questionCount}</span>

									{contentTypeStatistic
										? (<>
											<br />
											<span className='packageItemHeader'>{`${localization.content}: `}</span>
											<span>{Object.keys(contentTypeStatistic).map(
												key => `${this.getContentName(key)} (${contentTypeStatistic[key]})`).join(', ')}
											</span>
											</>)
										: null}

									<br />
									<span className='packageItemHeader'>{`${localization.roundsAndThemes}: `}</span>

									<ul className='rounds'>{rounds?.map((r, i) => <li key={i} className='roundInfo'>
										<span className='roundName'>{r.name}</span>: {r.themeNames.join(', ')}
										</li>)}
									</ul>

									<span className='packageItemHeader'>{`${localization.downloadCount}: `}</span>
									<span>{downloadCount}</span>

									<br />

									{contentUri
										? <div className="selectButton">
											<button
												type="button"
												className='standard'
												onClick={() => this.props.onSelect(id, name ?? '', contentUri)}>
												{localization.librarySelect}
											</button>
										</div>
										: null}
								</li>
							))}
					</ul>
				</div>
			</Dialog>
		);
	}
}

export default connect<StateProps, DispatchProps, OwnProps, State>(
	mapStateToProps,
	mapDispatchToProps
)(SIStorageDialog);
