import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import TableMode from '../../model/enums/TableMode';
import TableLogo from './TableLogo';
import TableText from './TableText';
import TablePartialText from './TablePartialText';
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
import TableRound from './TableRound';
import TableContent from './TableContent/TableContent';

import './GameTable.css';

interface GameTableProps {
	mode: TableMode;
	isPaused: boolean;
	isEditEnabled: boolean;
	isConnected: boolean;
	showMainTimer: boolean;
	decisionTimer: TimerInfo;
	caption: string;
	windowWidth: number;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	mode: state.table.mode,
	isPaused: state.room.stage.isGamePaused,
	isEditEnabled: state.room.stage.isEditEnabled,
	showMainTimer: state.room.showMainTimer,
	decisionTimer: state.room.timers.decision,
	caption: state.table.caption,
	windowWidth: state.ui.windowWidth,
});

function getContent(mode: TableMode) {
	switch (mode) {
		case TableMode.Logo:
			return <TableLogo />;

		case TableMode.Round:
			return <TableRound />;

		case TableMode.Text:
			return <TableText />;

		case TableMode.PartialText:
			return <TablePartialText />;

		case TableMode.Content:
			return <TableContent onMediaPlay={() => {}} />; // TODO

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

function getCaption(props: GameTableProps): string | null {
	switch (props.mode) {
		case TableMode.Text:
		case TableMode.PartialText:
		case TableMode.Content:
			return props.caption;

		default:
			return null;
	}
}

export function GameTable(props: GameTableProps): JSX.Element {
	const caption = getCaption(props);

	return (
		<div id="table">
			{caption ? (
				<div className="tableCaption">
					{caption}
				</div>
			) : null}

			<div className="tableContent">
				{getContent(props.mode)}
			</div>

			{props.showMainTimer ? (
				<ProgressBar
					className={`commonProgress ${caption ? 'captioned' : ''}`}
					value={1 - props.decisionTimer.value / props.decisionTimer.maximum}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}

			{(props.isPaused && !props.isEditEnabled) || !props.isConnected ? (
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

export default connect(mapStateToProps)(GameTable);
