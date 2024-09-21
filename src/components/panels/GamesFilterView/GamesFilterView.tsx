import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton';
import CheckBox from '../../common/CheckBox';
import getFilterValue from '../../../utils/getFilterValue';
import GamesFilter from '../../../model/enums/GamesFilter';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { connect } from 'react-redux';

import './GamesFilterView.scss';

interface GamesFilterViewProps {
	isConnected: boolean;
	gamesFilter: GamesFilter;
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	gamesFilter: state.online.gamesFilter,
});

const mapDispatchToProps = (dispatch: any) => ({
	onToggleFilterItem: (gamesFilterItem: GamesFilter) => {
		dispatch(onlineActionCreators.onGamesFilterToggle(gamesFilterItem));
	},
});

const GamesFilterView: React.FC<GamesFilterViewProps> = (props: GamesFilterViewProps) => {
	const isActive = props.gamesFilter > 0;
	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<FlyoutButton
			className={`gamesFilterButton ${isActive ? 'active' : ''}`}
			hideOnClick={false}
			title={localization.filter}
			flyout={(
				<ul className="gamesFilter">
					<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.New)}>
						<CheckBox isChecked={(props.gamesFilter & GamesFilter.New) > 0} header={localization.new} />
					</li>
					<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.Sport)}>
						<CheckBox isChecked={(props.gamesFilter & GamesFilter.Sport) > 0} header={localization.sportPlural} />
					</li>
					<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.Tv)}>
						<CheckBox isChecked={(props.gamesFilter & GamesFilter.Tv) > 0} header={localization.tvPlural} />
					</li>
					<li className={enabledClass} onClick={() => props.onToggleFilterItem(GamesFilter.NoPassword)}>
						<CheckBox isChecked={(props.gamesFilter & GamesFilter.NoPassword) > 0} header={localization.withoutPassword} />
					</li>
				</ul>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
		>
			<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M18.8194 13.6667H9.19358C8.7398 12.6385 7.70313 11.9167 6.49306 11.9167C5.28299 11.9167 4.24631 12.6385 3.79254 13.6667H1.18056C0.528668 13.6667 0 14.1891 0 14.8333C0 15.4776 0.528668 16 1.18056 16H3.79069C4.24631 17.0281 5.28299 17.75 6.49306 17.75C7.70313 17.75 8.73943 17.0292 9.19542 16H18.8194C19.4713 16 20 15.4776 20 14.8333C20 14.1891 19.4724 13.6667 18.8194 13.6667ZM6.49306 16C5.84227 16 5.3125 15.4765 5.3125 14.8333C5.3125 14.1902 5.84227 13.6667 6.49306 13.6667C7.14384 13.6667 7.67361 14.1902 7.67361 14.8333C7.67361 15.4765 7.14236 16 6.49306 16ZM18.8194 7.83333H15.0982C14.6426 6.80521 13.6059 6.08333 12.3958 6.08333C11.1858 6.08333 10.1491 6.80521 9.69531 7.83333H1.18056C0.528668 7.83333 0 8.35469 0 9C0 9.64531 0.528668 10.1667 1.18056 10.1667H9.69531C10.1491 11.1948 11.1858 11.9167 12.3958 11.9167C13.6059 11.9167 14.6422 11.1959 15.0982 10.1667H18.8194C19.4713 10.1667 20 9.64422 20 9C20 8.35578 19.4724 7.83333 18.8194 7.83333ZM12.3958 10.1667C11.7451 10.1667 11.2153 9.64312 11.2153 9C11.2153 8.35688 11.7451 7.83333 12.3958 7.83333C13.0466 7.83333 13.5764 8.35688 13.5764 9C13.5764 9.64312 13.0451 10.1667 12.3958 10.1667ZM1.18056 4.33333H4.97309C5.42687 5.36146 6.46354 6.08333 7.67361 6.08333C8.88368 6.08333 9.91999 5.36255 10.376 4.33333H18.8194C19.4713 4.33333 20 3.81089 20 3.16667C20 2.52245 19.4713 2 18.8194 2H10.3741C9.92036 0.970781 8.88368 0.25 7.67361 0.25C6.46354 0.25 5.42687 0.970781 4.97309 2H1.18056C0.528668 2 0 2.52245 0 3.16667C0 3.81089 0.528668 4.33333 1.18056 4.33333ZM7.67361 2C8.32439 2 8.85417 2.52354 8.85417 3.16667C8.85417 3.80979 8.32439 4.33333 7.67361 4.33333C7.02283 4.33333 6.49306 3.80979 6.49306 3.16667C6.49306 2.52354 7.02431 2 7.67361 2Z" fill="white"/>
			</svg>

		</FlyoutButton>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(GamesFilterView);