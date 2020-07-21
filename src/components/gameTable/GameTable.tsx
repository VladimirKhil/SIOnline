import * as React from 'react';
import State from '../../state/State';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';

import TableMode from '../../model/enums/TableMode';
import { TableLogo } from './TableLogo';
import TableText from './TableText';
import TablePartialText from './TablePartialText';
import TableImage from './TableImage';
import TableAudio from './TableAudio';
import TableVideo from './TableVideo';
import TableAnswer from './TableAnswer';
import TableGameThemes from './TableGameThemes';
import TableRoundThemes from './TableRoundThemes';
import RoundTable from './RoundTable';
import TableSpecial from './TableSpecial';
import FinalTable from './FinalTable';
import AutoSizedText from '../common/AutoSizedText';
import localization from '../../model/resources/localization';
import TimerInfo from '../../model/TimerInfo';
import ProgressBar from '../common/ProgressBar';
import { isRunning } from '../../utils/TimerInfoHelpers';

import './GameTable.css';

interface GameTableProps {
	mode: TableMode;
	isPaused: boolean;
	isConnected: boolean;
	showMainTimer: boolean;
	decisionTimer: TimerInfo;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	mode: state.run.table.mode,
	isPaused: state.run.stage.isGamePaused,
	showMainTimer: state.run.showMainTimer,
	decisionTimer: state.run.timers.decision
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function GameTable(props: GameTableProps) {
	return (
		<div id="table">
			{getContent(props.mode)}
			{props.showMainTimer ? (
				<ProgressBar className="commonProgress" value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0} />
				) : null}
			{props.isPaused || !props.isConnected ?
				<AutoSizedText maxFontSize={288} className={`pauseLogo tableText tableTextCenter ${props.isConnected ? '' : 'warning'}`}>
					{props.isPaused ? localization.pause : localization.connectionClosed}
				</AutoSizedText>
				: null}
		</div>
	);
}

function getContent(mode: TableMode) {
	switch (mode) {
		case TableMode.Logo:
			return <TableLogo />;

		case TableMode.Text:
			return <TableText />;

		case TableMode.PartialText:
			return <TablePartialText />;

		case TableMode.Image:
			return <TableImage />;

		case TableMode.Audio:
			return <TableAudio />;

		case TableMode.Video:
			return <TableVideo />;

		case TableMode.Answer:
			return <TableAnswer />;

		case TableMode.GameThemes:
			return <TableGameThemes />;

		case TableMode.RoundThemes:
			return <TableRoundThemes />;

		case TableMode.RoundTable:
			return <RoundTable />;

		case TableMode.Special:
			return <TableSpecial />;

		case TableMode.Final:
			return <FinalTable />;
	}

	return null;
}

export default connect(mapStateToProps, mapDispatchToProps)(GameTable);
