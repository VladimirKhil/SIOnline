import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import TableMode from '../../../model/enums/TableMode';
import TableLogo from '../TableLogo/TableLogo';
import TableText from '../TableText/TableText';
import TableGameThemes from '../TableGameThemes/TableGameThemes';
import TableRoundThemes from '../TableRoundThemes/TableRoundThemes';
import RoundTable from '../RoundTable/RoundTable';
import ThemeStack from '../ThemeStack/ThemeStack';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';
import TimerInfo from '../../../model/TimerInfo';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import { isRunning } from '../../../utils/TimerInfoHelpers';
import TableContent from '../TableContent/TableContent';
import ObjectView from '../ObjectView/ObjectView';
import { useAppSelector } from '../../../state/hooks';
import TableWelcome from '../TableWelcome/TableWelcome';
import TableStatistics from '../TableStatistics/TableStatistics';
import AnswerValidationBody from '../../game/AnswerValidationBody/AnswerValidationBody';
import Role from '../../../model/Role';
import { DecisionType } from '../../../state/room2Slice';

import './GameTable.css';

interface GameTableProps {
	mode: TableMode;
	isConnected: boolean;
	decisionTimer: TimerInfo;
	caption: string;
	windowWidth: number;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	mode: state.table.mode,
	decisionTimer: state.room.timers.decision,
	caption: state.table.caption,
	windowWidth: state.ui.windowWidth,
});

function getContent(mode: TableMode) {
	switch (mode) {
		case TableMode.Logo:
			return <TableLogo />;

		case TableMode.Welcome:
			return <TableWelcome />;

		case TableMode.Text:
			return <TableText />;

		case TableMode.Content:
			return <TableContent />;

		case TableMode.GameThemes:
			return <TableGameThemes />;

		case TableMode.RoundThemes:
			return <TableRoundThemes />;

		case TableMode.RoundTable:
			return <RoundTable />;

		case TableMode.ThemeStack:
			return <ThemeStack />;

		case TableMode.Statistics:
			return <TableStatistics />;

		case TableMode.Object:
		case TableMode.QuestionType:
			return <ObjectView />;

		default:
			return null;
	}
}

function getCaption(props: GameTableProps): string | null {
	switch (props.mode) {
		case TableMode.GameThemes:
			return localization.gameThemes;

		case TableMode.RoundThemes:
		case TableMode.ThemeStack:
			return localization.roundThemes;

		case TableMode.Logo:
		case TableMode.Text:
		case TableMode.Content:
		case TableMode.Object:
		case TableMode.QuestionType:
		case TableMode.Statistics:
			return props.caption ? props.caption : ' ';

		default:
			return ' ';
	}
}

export function GameTable(props: GameTableProps): JSX.Element {
	const tableState = useAppSelector((state) => state.table);
	const theme = useAppSelector((state) => state.settings.theme);
	const room = useAppSelector((state) => state.room2);
	const caption = getCaption(props);
	const themeProperties: React.CSSProperties = {};

	if (theme.table.textColor) {
		themeProperties.color = theme.table.textColor;
	}

	if (theme.table.backgroundColor) {
		themeProperties.backgroundColor = theme.table.backgroundColor;
	}

	if (theme.table.fontFamily) {
		themeProperties.fontFamily = theme.table.fontFamily;
	}

	const isPaused = room.stage.isGamePaused;
	const { noRiskMode } = room;

	const shouldShowAnswerValidationInTable = room.stage.decisionType === DecisionType.Validation &&
		room.validation.queue.length > 0 &&
		room.role === Role.Player;

	const showAppelation = room.stage.isAppellation && !shouldShowAnswerValidationInTable;

	return (
		<div id="table" style={themeProperties}>
			{caption ? (
				<div className="tableCaption">
					<div className='caption__left'>{noRiskMode ? <div title={localization.noRiskQuestion}>🛡</div> : ''}</div>
					<div className='tableCaptionContent'>{caption}</div>
				</div>
			) : null}

			<div className="tableContent">
				{getContent(props.mode)}
			</div>

			{shouldShowAnswerValidationInTable ? (
				<div className="answerValidationInTable">
					<AnswerValidationBody />
				</div>
			) : null}

			{tableState.contentHint.length > 0 ? <div className='contentHint'>{tableState.contentHint}</div> : null}

			{room.showMainTimer ? (
				<ProgressBar
					className={`commonProgress ${caption ? 'captioned' : ''}`}
					value={1 - (props.decisionTimer.value / props.decisionTimer.maximum)}
					valueChangeDuration={isRunning(props.decisionTimer) ? (props.decisionTimer.maximum - props.decisionTimer.value) / 10 : 0}
				/>
			) : null}

			{(isPaused && !room.isEditTableEnabled) || showAppelation || !props.isConnected ? (
				<AutoSizedText
					maxFontSize={144}
					className={`pauseLogo tableText tableTextCenter ${props.isConnected ? '' : 'warning'}`}
				>
					{isPaused ? localization.pause : (showAppelation ? localization.apellation : localization.connectionClosed)}
				</AutoSizedText>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(GameTable);
