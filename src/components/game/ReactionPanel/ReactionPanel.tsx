import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import Sex from '../../../model/enums/Sex';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DialogView, showDialog } from '../../../state/room2Slice';

import './ReactionPanel.css';

interface ReactionPanelProps {
	isConnected: boolean;
	sex: Sex;

	apellate: () => void;
	disagree: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	sex: state.settings.sex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	apellate: () => {
		dispatch(roomActionCreators.apellate() as object as Action);
	},
	disagree: () => {
		dispatch(roomActionCreators.disagree() as object as Action);
	},
});

export function ReactionPanel(props: ReactionPanelProps): JSX.Element | null {
	const room = useAppSelector(state => state.room2);
	const playerCount = room.persons.players.length;
	const appDispatch = useAppDispatch();
	const rightString = props.sex === Sex.Female ? localization.iAmRightFemale : localization.iAmRightMale;

	return (
		<div className='reactions reactions_panel'>
			{room.settings.useApellations
			? (<>
				<button
					type='button'
					className="reactionButton standard"
					disabled={!props.isConnected}
					title={localization.apellateAnswer}
					onClick={() => props.apellate()}>
					{rightString}
				</button>

				<button
					type='button'
					className="reactionButton standard"
					disabled={!props.isConnected || playerCount < 4} // 2 players cannot overvote third player + showman
					title={localization.iDisagreeHint}
					onClick={() => props.disagree()}>
					{localization.iDisagree}
				</button>
			</> )
			: null}

			<button
				type='button'
				className="reactionButton standard"
				disabled={!props.isConnected}
				title={localization.complainHint}
				onClick={() => appDispatch(showDialog(DialogView.Complain))}>
				{localization.complain}
			</button>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReactionPanel);