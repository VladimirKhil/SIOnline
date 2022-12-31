import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Dialog from './common/Dialog';
import localization from '../model/resources/localization';
import State from '../state/State';
import actionCreators from '../state/actionCreators';
import { PackageFilters } from '../model/PackageFilters';
import { SIPackageInfo } from '../model/SIPackageInfo';
import { SearchEntity } from '../model/SearchEntity';
import RestrictionType from '../model/enums/RestrictionType';

import './SIStorageDialog.css';

interface DispatchProps {
	searchPackages: (filters?: PackageFilters) => void;
	receiveAuthors: () => void;
	receiveTags: () => void;
	receivePublishers: () => void;
}

interface StateProps {
	packages: SIPackageInfo[];
	tags: SearchEntity[];
	publishers: SearchEntity[];
	authors: SearchEntity[];
	isLoading: boolean;
	error: string | null;
}

interface OwnProps {
	onClose: () => void;
	onSelect: (id: string, name: string) => void;
}

interface SIStorageDialogState extends PackageFilters {
	searchValue: string;
	prevSearchValue: string;
	prevPropsPackages: SIPackageInfo[];
	filteredPackages: SIPackageInfo[];
}

interface SIStorageDialogProps extends OwnProps, StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
	packages: state.siPackages.packages,
	isLoading: state.siPackages.isLoading,
	authors: state.siPackages.authors,
	publishers: state.siPackages.publishers,
	tags: state.siPackages.tags,
	error: state.siPackages.error,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>): DispatchProps => ({
	searchPackages: (filters?: PackageFilters) => {
		dispatch(actionCreators.searchPackagesThunk(filters) as unknown as Action);
	},
	receiveAuthors: () => {
		dispatch(actionCreators.receiveAuthorsThunk() as unknown as Action);
	},
	receivePublishers: () => {
		dispatch(actionCreators.receivePublishersThunk() as unknown as Action);
	},
	receiveTags: () => {
		dispatch(actionCreators.receiveTagsThunk() as unknown as Action);
	}
});

export class SIStorageDialog extends React.Component<SIStorageDialogProps, SIStorageDialogState> {
	constructor(props: SIStorageDialogProps) {
		super(props);

		this.state = {
			difficultyRelation: 0,
			difficulty: 1,
			sortMode: 0,
			sortAscending: true,
			authorId: null,
			publisherId: null,
			tagId: null,
			restriction: null,
			searchValue: '',
			prevSearchValue: '',
			prevPropsPackages: [],
			filteredPackages: []
		};
	}

	componentDidMount(): void {
		this.props.searchPackages();
		this.props.receiveAuthors();
		this.props.receivePublishers();
		this.props.receiveTags();
	}

	static getDerivedStateFromProps(
		props: SIStorageDialogProps,
		state: SIStorageDialogState
	): Partial<SIStorageDialogState> | null {
		if (state.searchValue !== state.prevSearchValue || state.prevPropsPackages !== props.packages) {
			return {
				prevSearchValue: state.searchValue,
				prevPropsPackages: props.packages,
				filteredPackages:
					state.searchValue.length > 0
						? props.packages.filter(({ description }) => description.toLocaleLowerCase().includes(state.searchValue.toLocaleLowerCase()))
						: props.packages
			};
		}
		return null;
	}

	private onSelectPackage = (id: string, name: string) => () => {
		this.props.onSelect(id, name);
	};

	private onSelectorChange =
		(filter: keyof Omit<PackageFilters, 'restriction' | 'sortAscending'>) => (event: React.ChangeEvent<HTMLSelectElement>) => {
			const { value } = event.target;
			this.setState(
				{
					[filter]: value === 'null' ? null : +value
				} as Pick<PackageFilters, typeof filter>,
				() => this.filterPackages()
			);
		};

	private onRestrictionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = event.target;
		this.setState(
			{
				restriction: value === 'null' ? null : value
			},
			() => this.filterPackages()
		);
	};

	private onSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState(
			{
				sortAscending: event.target.value === 'true'
			},
			() => this.filterPackages()
		);
	};

	private onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			searchValue: event.target.value
		});
	};

	private filterPackages = () => {
		const { searchValue, prevPropsPackages, prevSearchValue, filteredPackages, ...filters } = this.state;
		this.props.searchPackages(filters);
	};

	render(): JSX.Element {
		return (
			<Dialog id="siStorageDialog" title={localization.libraryTitle} onClose={this.props.onClose}>
				<div className="container">
					<div className="filters">
						<div>
							<span className="selectorName">{localization.packageSubject}</span>
							<select className="selector" value={String(this.state.tagId)} onChange={this.onSelectorChange('tagId')}>
								<option key="null" value="null">
									{localization.librarySearchAll}
								</option>
								<option key="-1" value="-1">
									{localization.librarySearchNotSet}
								</option>
								{this.props.tags.map(({ id, name }) => (
									<option key={id} value={id}>
										{name}
									</option>
								))}
							</select>
							<br />
							<span className="selectorName">{localization.packageDifficulty}</span>
							<div className="selectorsGroup">
								<select
									className="selectorDifRel"
									value={this.state.difficultyRelation}
									onChange={this.onSelectorChange('difficultyRelation')}
								>
									<option value="0">{localization.librarySearchMoreOrEqual}</option>
									<option value="1">{localization.librarySearchLessOrEqual}</option>
								</select>
								<select
									className="selectorDif"
									value={this.state.difficulty}
									onChange={this.onSelectorChange('difficulty')}
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
								value={String(this.state.publisherId)}
								onChange={this.onSelectorChange('publisherId')}
							>
								<option key="null" value="null">
									{localization.librarySearchAll}
								</option>
								<option key="-1" value="-1">
									{localization.librarySearchNotSet}
								</option>
								{this.props.publishers.map(({ id, name }) => (
									<option key={id} value={id}>
										{name}
									</option>
								))}
							</select>
							<br />
							<span className="selectorName">{localization.packageAuthor}</span>
							<select
								className="selector"
								value={String(this.state.authorId)}
								onChange={this.onSelectorChange('authorId')}
							>
								<option key="null" value="null">
									{localization.librarySearchAll}
								</option>
								{this.props.authors.map(({ id, name }) => (
									<option key={id} value={id}>
										{name}
									</option>
								))}
							</select>
							<br />
						</div>
						<div>
							<span className="selectorName">{localization.packageRestriction}</span>
							<select className="selector" value={String(this.state.restriction)} onChange={this.onRestrictionChange}>
								<option value="null">{localization.librarySearchNotSet}</option>
								<option value={RestrictionType.Age12}>{RestrictionType.Age12}</option>
								<option value={RestrictionType.Age18}>{RestrictionType.Age18}</option>
							</select>
							<br />
							<span className="selectorName">{localization.filter}</span>
							<input className="textFilter" type="text" value={this.state.searchValue} onChange={this.onSearchChange} />
							<br />
							<span className="selectorName">{localization.sort}</span>
							<div className="selectorsGroup">
								<select
									className="selectorSortMode"
									value={this.state.sortMode}
									onChange={this.onSelectorChange('sortMode')}
								>
									<option value="0">{localization.name}</option>
									<option value="1">{localization.packagePublishedDate}</option>
								</select>
								<select
									className="selectorSortDir"
									value={this.state.sortAscending.toString()}
									onChange={this.onSortChange}
								>
									<option value="false">{localization.descending}</option>
									<option value="true">{localization.ascending}</option>
								</select>
							</div>
						</div>
					</div>
					<h2>{`${localization.packages} (${this.state.filteredPackages.length})`}</h2>
					{this.props.error != null ? <div className='sistorage_error'>{this.props.error}</div> : null}
					{this.props.isLoading && <p>{localization.loading}</p>}
					<ul>
						{this.state.filteredPackages.map(({ authors,
							description,
							difficulty,
							id,
							guid,
							publishedDate,
							publisher,
							restriction,
							tags }) => (
								<li key={id}>
									<span className="packageName">{description}</span>
									<br />
									<span>{`${localization.packageSubject}: `}</span>
									<span>{tags}</span>
									<br />
									<span>{`${localization.packageDifficulty}: `}</span>
									<span>{difficulty}</span>
									<br />
									<span>{`${localization.packagePublisher}: `}</span>
									<span>{publisher}</span>
									<br />
									<span>{`${localization.packageAuthor}: `}</span>
									<span className="breakable">{authors}</span>
									<br />
									<span>{`${localization.packageRestriction}: `}</span>
									<span className="breakable">{restriction}</span>
									<br />
									<span>{`${localization.packagePublishedDate}: `}</span>
									<span>{new Date(publishedDate).toLocaleDateString()}</span>
									<br />
									<div className="selectButton">
										<button type="button" className='standard' onClick={this.onSelectPackage(guid, description)}>
											{localization.librarySelect}
										</button>
									</div>
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
