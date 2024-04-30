import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import Sex from '../../../model/enums/Sex';
import roomActionCreators from '../../../state/room/roomActionCreators';

import './ReactionPanel.css';

interface ReactionPanelProps {
	isConnected: boolean;
	sex: Sex;
	areApellationsEnabled: boolean;
	playersCount: number;

	apellate: () => void;
	disagree: () => void;
	onMarkQuestion: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	sex: state.settings.sex,
	areApellationsEnabled: state.room.areApellationsEnabled,
	playersCount: state.room.persons.players.length,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	apellate: () => {
		dispatch(roomActionCreators.apellate() as object as Action);
	},
	disagree: () => {
		dispatch(roomActionCreators.disagree() as object as Action);
	},
	onMarkQuestion: () => {
		dispatch(roomActionCreators.markQuestion() as unknown as Action);
	},
});

export function ReactionPanel(props: ReactionPanelProps): JSX.Element | null {
	const rightString = props.sex === Sex.Female ? localization.iAmRightFemale : localization.iAmRightMale;

	return (
		<div className='reactions reactions_panel'>
			{props.areApellationsEnabled
			? (<>
				<button
					type='button'
					className="reactionButton"
					disabled={!props.isConnected}
					title={localization.apellateAnswer}
					onClick={() => props.apellate()}>
					{rightString}
				</button>

				<button
					type='button'
					className="reactionButton"
					disabled={!props.isConnected || props.playersCount < 4} // 2 players cannot overvote third player + showman
					title={localization.iDisagreeHint}
					onClick={() => props.disagree()}>
					{localization.iDisagree}
				</button>
			</> )
			: null}

			{/* <button
				className="reactionButton"
				disabled={!props.isConnected}
				title={localization.complainHint}
				onClick={() => props.onMarkQuestion()}>
				{localization.complain}
			</button> */}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReactionPanel);