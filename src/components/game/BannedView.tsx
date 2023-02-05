import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import localization from '../../model/resources/localization';
import State from '../../state/State';
import roomActionCreators from '../../state/room/roomActionCreators';

import './BannedView.css';

interface BannedViewProps {
	isConnected: boolean;
	banned: Record<string, string>;
	selectedInfoIp: string | null;

	selectItem: (ip: string) => void;
	unban: (ip: string) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	banned: state.room.banned.entries,
	selectedInfoIp: state.room.banned.selectedIp,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	selectItem: (ip: string) => {
		dispatch(roomActionCreators.selectBannedItem(ip) as object as Action);
	},
	unban: (ip: string) => {
		dispatch(roomActionCreators.unban(ip) as object as Action);
	},
});

export function BannedView(props: BannedViewProps): JSX.Element {
	return (
		<div className='bannedView'>
			<ul className='bannedList'>
				{Object.keys(props.banned).map(ip => (
					<li
						className={`bannedItem ${ip === props.selectedInfoIp ? 'selected' : ''}`}
						onClick={() => props.selectItem(ip)}>
						<span>{ip} ({props.banned[ip]})</span>
					</li>
				))}
			</ul>

			<div className="buttonsPanel">
				<button
					type="button"
					className='standard'
					onClick={() => props.unban(props.selectedInfoIp ?? '')}
					disabled={!props.isConnected || !props.selectedInfoIp}>
					{localization.unban}
				</button>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(BannedView);
