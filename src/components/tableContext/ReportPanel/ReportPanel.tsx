import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DialogView, showDialog } from '../../../state/room2Slice';

import './ReportPanel.css';

interface ReportPanelProps {
	isConnected: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
});

export function ReportPanel(props: ReportPanelProps): JSX.Element | null {
	const appDispatch = useAppDispatch();
	const packageUri = useAppSelector(state => state.room2.playState.packageUri);
	const enabledClass = props.isConnected ? '' : 'disabled';

	const handleReviewPackage = () => {
		if (packageUri) {
			window.open(packageUri, '_blank');
		}
	};

	return (
		<div className={`reportPanel${packageUri ? ' two-buttons' : ''}`}>
			<button
				type="button"
				className={`report_button standard ${enabledClass}`}
				onClick={() => appDispatch(showDialog(DialogView.Report))}
			>
				<span>{`⭐ ${localization.rateGame}`}</span>
			</button>

			{packageUri ? (
				<button
					type="button"
					className="report_button standard"
					onClick={handleReviewPackage}
				>
					<span>{`📦 ${localization.reviewPackage}`}</span>
				</button>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(ReportPanel);