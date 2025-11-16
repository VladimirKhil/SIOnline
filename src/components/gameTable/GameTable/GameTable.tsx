import * as React from 'react';
import TableMode from '../../../model/enums/TableMode';
import TableLogo from '../TableLogo/TableLogo';
import TableText from '../TableText/TableText';
import TableGameThemes from '../TableGameThemes/TableGameThemes';
import TableRoundThemes from '../TableRoundThemes/TableRoundThemes';
import RoundTable from '../RoundTable/RoundTable';
import ThemeStack from '../ThemeStack/ThemeStack';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';
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

function getCaption(mode: TableMode, caption: string): string | null {
	switch (mode) {
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
			return caption ? caption : ' ';

		default:
			return ' ';
	}
}

export function GameTable(): JSX.Element {
	// Combine related selectors to minimize selector calls while maintaining granular subscriptions
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);

	const { mode, caption: tableCaption, contentHint } = useAppSelector((state) => ({
		mode: state.table.mode,
		caption: state.table.caption,
		contentHint: state.table.contentHint,
	}));

	const tableTheme = useAppSelector((state) => state.settings.theme.table);

	const {
		stage: { isGamePaused: isPaused, decisionType, isAppellation },
		noRiskMode,
		validation: { queue: { length: validationQueueLength } },
		role,
		showMainTimer,
		isEditTableEnabled,
		decisionTimer,
	} = useAppSelector((state) => ({
		stage: {
			isGamePaused: state.room2.stage.isGamePaused,
			decisionType: state.room2.stage.decisionType,
			isAppellation: state.room2.stage.isAppellation,
		},
		noRiskMode: state.room2.noRiskMode,
		validation: { queue: { length: state.room2.validation.queue.length } },
		role: state.room2.role,
		showMainTimer: state.room2.showMainTimer,
		isEditTableEnabled: state.room2.isEditTableEnabled,
		decisionTimer: state.room2.timers.decision,
	}));

	const caption = getCaption(mode, tableCaption);
	const themeProperties: React.CSSProperties = {};

	if (tableTheme.textColor) {
		themeProperties.color = tableTheme.textColor;
	}

	if (tableTheme.backgroundColor) {
		themeProperties.backgroundColor = tableTheme.backgroundColor;
	}

	if (tableTheme.fontFamily) {
		themeProperties.fontFamily = tableTheme.fontFamily;
	}

	const shouldShowAnswerValidationInTable = decisionType === DecisionType.Validation &&
		validationQueueLength > 0 &&
		role === Role.Player;

	const showAppelation = isAppellation && !shouldShowAnswerValidationInTable;

	return (
		<div id="table" style={themeProperties}>
			{caption ? (
				<div className="tableCaption">
					<div className='caption__left'>{noRiskMode ? <div title={localization.noRiskQuestion}>🛡</div> : ''}</div>
					<div className='tableCaptionContent'>{caption}</div>
				</div>
			) : null}

			<div className="tableContent">
				{getContent(mode)}
			</div>

			{shouldShowAnswerValidationInTable ? (
				<div className="answerValidationInTable">
					<AnswerValidationBody />
				</div>
			) : null}

			{contentHint.length > 0 ? <div className='contentHint'>{contentHint}</div> : null}

			{showMainTimer ? (
				<ProgressBar
					className={`commonProgress ${caption ? 'captioned' : ''}`}
					value={1 - (decisionTimer.value / decisionTimer.maximum)}
					valueChangeDuration={isRunning(decisionTimer) ? (decisionTimer.maximum - decisionTimer.value) / 10 : 0}
				/>
			) : null}

			{(isPaused && !isEditTableEnabled) || showAppelation || !isConnected ? (
				<AutoSizedText
					maxFontSize={144}
					className={`pauseLogo tableText tableTextCenter ${isConnected ? '' : 'warning'}`}
				>
					{isPaused ? localization.pause : (showAppelation ? localization.apellation : localization.connectionClosed)}
				</AutoSizedText>
			) : null}
		</div>
	);
}

export default GameTable;
