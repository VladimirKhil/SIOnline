import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import Role from '../../../model/Role';
import StakePanel from '../stakes/StakePanel/StakePanel';
import ReactionPanel from '../ReactionPanel/ReactionPanel';
import AnswerInput from '../AnswerInput/AnswerInput';
import PlayerButtonsPanel from '../PlayerButtonsPanel/PlayerButtonsPanel';
import ReadyButton from '../ReadyButton/ReadyButton';
import GameHint from '../GameHint/GameHint';
import { useAppSelector } from '../../../state/hooks';
import { RootState } from '../../../state/store';
import { ContextView } from '../../../state/room2Slice';
import ReportButton from '../ReportButton/ReportButton';
import EditTableButton from '../EditTableButton/EditTableButton';
import TableMode from '../../../model/enums/TableMode';
import OralAnswer from '../OralAnswer/OralAnswer';
import AnswerValidationButtons from '../AnswerValidationButtons/AnswerValidationButtons';
import { DecisionType } from '../../../state/room2Slice';

import './TableContextView.css';

interface TableContextViewProps {
	areStakesVisible: boolean;
	isAfterQuestion: boolean;
	isAutomatic: boolean;
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	areStakesVisible: state.room.stakes.areVisible,
	isAfterQuestion: state.room.stage.isAfterQuestion,
	isAutomatic: state.game.isAutomatic,
	hint: state.room.hint,
});

function renderBody(
	props: TableContextViewProps,
	contextView: ContextView,
	windowWidth: number,
	tableMode: TableMode,
	isGameStarted: boolean,
	isGamePaused: boolean,
	role: Role,
	decisionType: DecisionType,
) : JSX.Element | null {
	// Check for DecisionType.Validation first for players
	if (decisionType === DecisionType.Validation && role === Role.Player) {
		return <AnswerValidationButtons />;
	}

	// TODO: Switch to enum to select view to display
	switch (contextView) {
		case ContextView.Answer:
			return <AnswerInput id="answerBoxWide" />;

		case ContextView.OralAnswer:
			return <OralAnswer />;

		case ContextView.Report:
			return <ReportButton />;

		default:
			break;
	}

	if (!isGameStarted && !props.isAutomatic && role !== Role.Viewer) {
		return <ReadyButton />;
	}

	if (props.areStakesVisible) {
		return <StakePanel />;
	}

	const defaultView = role === Role.Showman ? <div className='emptyContext' /> : null;

	if (props.isAfterQuestion && role === Role.Player) {
		return <ReactionPanel />;
	}

	if (role === Role.Player) {
		return <PlayerButtonsPanel />;
	}

	if (props.hint && windowWidth < 800) {
		return <GameHint />;
	}

	if (isGamePaused && role === Role.Showman && tableMode === TableMode.RoundTable) {
		return <EditTableButton />;
	}

	return defaultView;
}

export function TableContextView(props: TableContextViewProps): JSX.Element | null {
	const state = useAppSelector((rootState: RootState) => rootState.room2);
	const ui = useAppSelector(rootState => rootState.ui);
	const table = useAppSelector(rootState => rootState.table);
	const room = useAppSelector(rootState => rootState.room2);

	const body = renderBody(
		props,
		state.contextView,
		ui.windowWidth,
		table.mode,
		room.stage.isGameStarted,
		room.stage.isGamePaused,
		room.role,
		room.stage.decisionType,
	);

	return body == null ? null : <div className='tableContextView'>{body}</div>;
}

export default connect(mapStateToProps)(TableContextView);