/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import Dialog from '../../common/Dialog';
import { DialogView, complain, showDialog } from '../../../state/new/room2Slice';
import { useAppDispatch } from '../../../state/new/hooks';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';

import './ComplainDialog.css';

interface ComplainDialogProps {
	isConnected: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
});

export function ComplainDialog(props: ComplainDialogProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const [selectedComplainType, setSelectedComplainType] = React.useState(0);
	const [complainText, setComplainText] = React.useState('');

	const onInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedComplainType(parseInt(e.target.value, 10));
		}
	};

	return (
		<Dialog
			className='complainDialog'
			title={localization.questionComplain}
			onClose={() => appDispatch(showDialog(DialogView.None))}>
			<div className='dialogBody'>
				<div className='dialogOptions'>
					<div>
						<input
							type="radio"
							id="syntaxError"
							name="complainType"
							value={0}
							checked={selectedComplainType === 0}
							onChange={onInputChanged} />

						<label htmlFor='syntaxError'>{localization.syntaxError}</label>
					</div>

					<div>
						<input
							type="radio"
							id="wrongAnswer"
							name="complainType"
							value={1}
							checked={selectedComplainType === 1}
							onChange={onInputChanged}/>

						<label htmlFor='wrongAnswer'>{localization.wrongAnswer}</label>
					</div>

					<div>
						<input
							type="radio"
							id="copyrightIssue"
							name="complainType"
							value={2}
							checked={selectedComplainType === 2}
							onChange={onInputChanged}/>

						<label htmlFor='copyrightIssue'>{localization.copyrightIssue}</label>
					</div>

					<div>
						<input
							type="radio"
							id="restrictionIssue"
							name="complainType"
							value={3}
							checked={selectedComplainType === 3}
							onChange={onInputChanged}/>

						<label htmlFor='restrictionIssue'>{localization.restrictionIssue}</label>
					</div>

					<div>
						<input
							type="radio"
							id="lawIssue"
							name="complainType"
							value={4}
							checked={selectedComplainType === 4}
							onChange={onInputChanged}/>

						<label htmlFor='lawIssue'>{localization.lawIssue}</label>
					</div>

					<div>
						<input
							type="radio"
							id="other"
							name="complainType"
							value={5}
							checked={selectedComplainType === 5}
							onChange={onInputChanged}/>

						<label htmlFor='other'>{localization.other}</label>
					</div>

					<label className='complainTextComment' htmlFor='complainText'>{localization.comment}</label>

					<input
						type='text'
						value={complainText}
						disabled={!props.isConnected}
						onChange={(e) => setComplainText(e.target.value)}
						aria-label='Complain text' />
				</div>

				<div className="buttonsPanel">
					<button
						type="button"
						className='standard sendButton'
						disabled={!props.isConnected}
						onClick={() => appDispatch(complain({
							questionId: -1,
							complainText: `${selectedComplainType} ${complainText}`,
						}))}>
						{localization.send}
					</button>
				</div>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps)(ComplainDialog);
