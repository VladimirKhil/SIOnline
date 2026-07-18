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
import { getQuestionStatsPercents, getQuestionStatsPosition } from '../../../utils/QuestionStatsHelpers';
import TableContent from '../TableContent/TableContent';
import ObjectView from '../ObjectView/ObjectView';
import { useAppSelector } from '../../../state/hooks';
import TableWelcome from '../TableWelcome/TableWelcome';
import TableStatistics from '../TableStatistics/TableStatistics';
import AnswerValidationBody from '../AnswerValidationBody/AnswerValidationBody';
import Role from '../../../model/Role';
import { DecisionType } from '../../../state/room2Slice';
import VolumeButton from '../../common/VolumeButton/VolumeButton';
import { useAudioContext } from '../../../contexts/AudioContextProvider';
import ContentType from '../../../model/enums/ContentType';
import LayoutMode from '../../../model/enums/LayoutMode';
import PointsOverlay from '../PointsOverlay/PointsOverlay';

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

function getCaption(mode: TableMode, caption: string): string {
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
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);
	const { canPlayAudio } = useAudioContext();
	const mode = useAppSelector((state) => state.table.mode);
	const tableCaption = useAppSelector((state) => state.table.caption);
	const contentHint = useAppSelector((state) => state.table.contentHint);
	const audio = useAppSelector((state) => state.table.audio);
	const content = useAppSelector((state) => state.table.content);
	const cooperativeHtmlVolumeSupportIds = useAppSelector((state) => state.table.cooperativeHtmlVolumeSupportIds);

	const tableTheme = useAppSelector((state) => state.settings.theme.table);
	const isGamePaused = useAppSelector((state) => state.room2.stage.isGamePaused);
	const decisionType = useAppSelector((state) => state.room2.stage.decisionType);
	const isAppellation = useAppSelector((state) => state.room2.stage.isAppellation);
	const noRiskMode = useAppSelector((state) => state.room2.noRiskMode);
	const validationQueue = useAppSelector((state) => state.room2.validation.queue);
	const role = useAppSelector((state) => state.room2.role);
	const showMainTimer = useAppSelector((state) => state.room2.showMainTimer);
	const isEditTableEnabled = useAppSelector((state) => state.room2.isEditTableEnabled);
	const decisionTimer = useAppSelector((state) => state.room2.timers.decision);
	const answerDeviation = useAppSelector((state) => state.table.answerDeviation);
	const layoutMode = useAppSelector((state) => state.table.layoutMode);
	const isAnswer = useAppSelector((state) => state.table.isAnswer);
	const activeThemeIndex = useAppSelector((state) => state.table.activeThemeIndex);
	const actionQuestionIndex = useAppSelector((state) => state.table.actionQuestionIndex);
	const roundIndex = useAppSelector((state) => state.room.stage.roundIndex);
	const roundInfo = useAppSelector((state) => state.table.roundInfo);
	const themeName = useAppSelector((state) => state.room2.theme.name);
	const packageStats = useAppSelector((state) => state.room2.playState.packageStats);
	const completedGameCount = useAppSelector((state) => state.room2.playState.completedGameCount);

	const shouldShowAnswerValidationInTable = decisionType === DecisionType.Validation &&
		validationQueue.length > 0 &&
		role === Role.Player;

	const caption = shouldShowAnswerValidationInTable
		? localization.validateAnswer
		: getCaption(mode, tableCaption);

	const questionStats = isAnswer || caption === localization.rightAnswer
		? getQuestionStatsPercents(
			packageStats,
			completedGameCount,
			roundIndex,
			getQuestionStatsPosition(roundInfo, themeName, activeThemeIndex, actionQuestionIndex),
		)
		: null;

	const themeProperties: React.CSSProperties = {};
	const reversedPropeties: React.CSSProperties = {};

	if (tableTheme.textColor) {
		themeProperties.color = tableTheme.textColor;
		reversedPropeties.backgroundColor = tableTheme.textColor;
	}

	if (tableTheme.backgroundColor) {
		themeProperties.backgroundColor = tableTheme.backgroundColor;
		reversedPropeties.color = tableTheme.backgroundColor;
	}

	if (tableTheme.fontFamily) {
		themeProperties.fontFamily = tableTheme.fontFamily;
	}

	const showAppelation = isAppellation && !shouldShowAnswerValidationInTable;
	const hasSound = audio.length > 0 ||
		content.some(g => g.content.some(c => c.type === ContentType.Video)) ||
		cooperativeHtmlVolumeSupportIds.length > 0;

	return (
		<div id="table" style={themeProperties}>
			{caption ? (
				<div className="tableCaption">
					<div className='caption__left'>
						{noRiskMode ? <div title={localization.noRiskQuestion}>🛡</div> : ''}
						{answerDeviation !== 0 && layoutMode !== LayoutMode.OverlayPoints
							? <div className='answer__deviation' style={reversedPropeties} title={localization.answerDeviation}>
								± {answerDeviation}
								</div>
							: ''}
					</div>
					<div className='tableCaptionContent'>{caption}</div>
					<div className='caption__right'>
						{questionStats ? (
							<div className='questionStats'>
								<span className='questionStats__tries' title={localization.answerTries}>{questionStats.triesPercent}%</span>
								<span className='questionStats__right' title={localization.rightAnswers}>{questionStats.rightPercent}%</span>
							</div>
						) : null}
						{hasSound && <VolumeButton canPlayAudio={canPlayAudio} />}
					</div>
				</div>
			) : null}

			<div className="tableContent">
				{getContent(mode)}
				{layoutMode === LayoutMode.OverlayPoints ? <PointsOverlay /> : null}
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

			{(isGamePaused && !isEditTableEnabled) || showAppelation || !isConnected ? (
				<AutoSizedText
					maxFontSize={144}
					className={`pauseLogo tableText tableTextCenter ${isConnected ? '' : 'warning'}`}
				>
					{isGamePaused ? localization.pause : (showAppelation ? localization.apellation : localization.connectionClosed)}
				</AutoSizedText>
			) : null}
		</div>
	);
}

export default GameTable;
