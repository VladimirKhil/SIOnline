import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/hooks';
import { DialogView, showDialog } from '../../../state/room2Slice';

import './ReportButton.css';

interface ReadyButtonProps {
	isConnected: boolean;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
});

export function ReportButton(props: ReadyButtonProps): JSX.Element | null {
	const appDispatch = useAppDispatch();
	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<button
			type="button"
			className={`report_button standard ${enabledClass}`}
			onClick={() => appDispatch(showDialog(DialogView.Report))}
		>
			<span>{`⭐ ${localization.rateGame}`}</span>
		</button>
	);
}

export default connect(mapStateToProps)(ReportButton);