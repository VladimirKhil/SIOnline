import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import GamesFilter from '../../../model/enums/GamesFilter';
import localization from '../../../model/resources/localization';
import { onGameFilterToggle } from '../../../state/online2Slice';
import getLanguage from '../../../utils/getLanguage';

import './GamesFilterView.scss';

interface FilterOption {
	filter: GamesFilter;
	label: string;
}

interface FilterGroup {
	title: string;
	singleColumn?: boolean;
	options: FilterOption[];
}

export default function GamesFilterView() {
	const gamesFilter = useAppSelector(state => state.online2.gamesFilter);

	const appDispatch = useAppDispatch();
	const isActive = gamesFilter !== GamesFilter.All;

	const onToggleFilterItem = (gamesFilterItem: GamesFilter) => {
		appDispatch(onGameFilterToggle(gamesFilterItem));
	};

	const myLanguage = getLanguage(localization.getLanguage());
	const filterGroups: FilterGroup[] = [
		{
			title: localization.gameType,
			singleColumn: true,
			options: [
				{ filter: GamesFilter.Classic, label: localization.tv },
				{ filter: GamesFilter.Simple, label: localization.sport },
				{ filter: GamesFilter.Quiz, label: localization.quiz },
				{ filter: GamesFilter.TurnTaking, label: localization.turnTaking },
			],
		},
		{
			title: localization.password,
			options: [
				{ filter: GamesFilter.PasswordRequired, label: localization.yes },
				{ filter: GamesFilter.NoPassword, label: localization.no },
			],
		},
		{
			title: localization.oral,
			options: [
				{ filter: GamesFilter.OralYes, label: localization.yes },
				{ filter: GamesFilter.OralNo, label: localization.no },
			],
		},
		{
			title: localization.language,
			singleColumn: true,
			options: [
				{ filter: GamesFilter.MyLanguage, label: localization.languageFilterMy },
				{ filter: GamesFilter.OtherLanguage, label: localization.languageFilterOther },
			],
		},
	];

	return (
		<FlyoutButton
			className={`gamesFilterButton ${isActive ? 'active' : ''}`}
			hideOnClick={false}
			title={localization.filter}
			flyout={(
				<div className="gamesFilter">
					{filterGroups.map(group => (
						<section
							className={`gamesFilterGroup ${group.singleColumn ? 'singleColumn' : ''}`}
							key={group.title}
						>
							<div className="gamesFilterGroupTitle">{group.title}</div>
							<div className="gamesFilterOptions">
								{group.options.map(option => {
									const checked = (gamesFilter & option.filter) > 0;
									const label = option.filter === GamesFilter.MyLanguage ? myLanguage : option.label;

									return (
										<button
											type="button"
											className={`gamesFilterOption ${checked ? 'checked' : ''}`}
											key={option.filter}
											onClick={() => onToggleFilterItem(option.filter)}
											title={label}
											aria-label={label}
										>
											<span className="gamesFilterOptionLabel">{label}</span>
										</button>
									);
								})}
							</div>
							</section>
					))}
				</div>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
		>
			<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d="M3 3H17M3 9H17M3 15H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
				<circle cx="7" cy="3" r="2" fill="white" />
				<circle cx="13" cy="9" r="2" fill="white" />
				<circle cx="9" cy="15" r="2" fill="white" />
			</svg>
		</FlyoutButton>
	);
}