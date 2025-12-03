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
import VolumeButton from '../../common/VolumeButton/VolumeButton';
import { useAudioContext } from '../../../contexts/AudioContextProvider';
import ContentType from '../../../model/enums/ContentType';

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
	// Combine related selectors to minimize selector calls while maintaining granular subscriptions
	const isConnected = useAppSelector((state) => state.common.isSIHostConnected);
	const { canPlayAudio } = useAudioContext();

	const { mode, caption: tableCaption, contentHint, audio, content } = useAppSelector((state) => ({
		mode: state.table.mode,
		caption: state.table.caption,
		contentHint: state.table.contentHint,
		audio: state.table.audio,
		content: state.table.content,
	}));

	const tableTheme = useAppSelector((state) => state.settings.theme.table);

	const {
		isGamePaused,
		decisionType,
		isAppellation,
		noRiskMode,
		validationQueue,
		role,
		showMainTimer,
		isEditTableEnabled,
		decisionTimer,
		answerDeviation,
	} = useAppSelector((state) => ({
		isGamePaused: state.room2.stage.isGamePaused,
		decisionType: state.room2.stage.decisionType,
		isAppellation: state.room2.stage.isAppellation,
		noRiskMode: state.room2.noRiskMode,
		validationQueue: state.room2.validation.queue,
		role: state.room2.role,
		showMainTimer: state.room2.showMainTimer,
		isEditTableEnabled: state.room2.isEditTableEnabled,
		decisionTimer: state.room2.timers.decision,
		answerDeviation: state.table.answerDeviation,
	}));

	const shouldShowAnswerValidationInTable = decisionType === DecisionType.Validation &&
		validationQueue.length > 0 &&
		role === Role.Player;

	const caption = shouldShowAnswerValidationInTable
		? localization.validateAnswer.replace('{0}', validationQueue[0].name)
		: getCaption(mode, tableCaption);

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
	const hasSound = audio.length > 0 || content.some(g => g.content.some(c => c.type === ContentType.Video));

	return (
		<div id="table" style={themeProperties}>
			{caption ? (
				<div className="tableCaption">
					<div className='caption__left'>
						{noRiskMode ? <div title={localization.noRiskQuestion}>🛡</div> : ''}
						{answerDeviation !== 0
							? <div className='answer__deviation' style={reversedPropeties} title={localization.answerDeviation}>
								± {answerDeviation}
								</div>
							: ''}
					</div>
					<div className='tableCaptionContent'>{caption}</div>
					<div className='caption__right'>
						{hasSound && <VolumeButton canPlayAudio={canPlayAudio} />}
					</div>
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
