import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import Sex from '../../../model/enums/Sex';
import { apellate, disagree } from '../../../state/serverActions';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DialogView, showDialog } from '../../../state/room2Slice';

import './ReactionPanel.css';

interface ReactionPanelProps {
	isConnected: boolean;
	sex: Sex;

}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	sex: state.settings.sex,
});

export function ReactionPanel(props: ReactionPanelProps): JSX.Element | null {
	const playerCount = useAppSelector(state => state.room2.persons.players.length);
	const useApellations = useAppSelector(state => state.room2.settings.useApellations);
	const appDispatch = useAppDispatch();
	const rightString = props.sex === Sex.Female ? localization.iAmRightFemale : localization.iAmRightMale;

	return (
		<div className='reactions reactions_panel'>
			{useApellations
			? (<>
				<button
					type='button'
					className="reactionButton standard"
					disabled={!props.isConnected}
					title={localization.apellateAnswer}
					onClick={() => appDispatch(apellate())}>
					{rightString}
				</button>

				<button
					type='button'
					className="reactionButton standard"
					disabled={!props.isConnected || playerCount < 4} // 2 players cannot overvote third player + showman
					title={localization.iDisagreeHint}
					onClick={() => appDispatch(disagree())}>
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

export default connect(mapStateToProps)(ReactionPanel);