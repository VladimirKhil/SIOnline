import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';

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
	caption: string;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	mode: state.run.table.mode,
	isPaused: state.run.stage.isGamePaused,
	showMainTimer: state.run.showMainTimer,
	decisionTimer: state.run.timers.decision,
	caption: state.run.table.caption
});

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

		default:
			return null;
	}
}

function showCaption(mode: TableMode): boolean {
	switch (mode) {
		case TableMode.Text:
		case TableMode.PartialText:
		case TableMode.Image:
		case TableMode.Audio:
		case TableMode.Video:
			return true;

		default:
			return false;
	}
}

export function GameTable(props: GameTableProps): JSX.Element {
	return (
		<div id="table">
			{showCaption(props.mode) ? (
				<div className="tableCaption">
					{props.caption}
				</div>
			) : null}
			<div className="tableContent">
				{getContent(props.mode)}
			</div>
			{props.showMainTimer ? (
				<ProgressBar
					className="commonProgress"
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}
			{props.isPaused || !props.isConnected ? (
				<AutoSizedText
					maxFontSize={288}
					className={`pauseLogo tableText tableTextCenter ${props.isConnected ? '' : 'warning'}`}
				>
					{props.isPaused ? localization.pause : localization.connectionClosed}
				</AutoSizedText>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps, {})(GameTable);
