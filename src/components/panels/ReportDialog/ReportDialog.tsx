/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import Dialog from '../../common/Dialog/Dialog';
import { DialogView, sendGameReport, showDialog } from '../../../state/room2Slice';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';

import './ReportDialog.css';

interface ComplainDialogProps {
	isConnected: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
});

export function ReportDialog(props: ComplainDialogProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const report = useAppSelector(state => state.room2.playState.report);
	const [comment, setComment] = React.useState('');

	return (
		<Dialog
			className='reportDialog'
			title={localization.rateGame}
			onClose={() => appDispatch(showDialog(DialogView.None))}>
			<div className='dialogBody'>
				<div className='reportText'>{report}</div>

				<label className='complainTextComment' htmlFor='complainText'>{localization.comment}</label>

				<input
					type='text'
					value={comment}
					disabled={!props.isConnected}
					onChange={(e) => setComment(e.target.value)}
					aria-label='Comment' />

				<div className="buttonsPanel">
					<button
						type="button"
						className='standard sendButton'
						disabled={!props.isConnected}
						onClick={() => appDispatch(sendGameReport(comment))}>
						{localization.send}
					</button>
				</div>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps)(ReportDialog);
