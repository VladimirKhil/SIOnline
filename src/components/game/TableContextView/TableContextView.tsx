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

import './TableContextView.css';

interface TableContextViewProps {
	role: Role;
	areStakesVisible: boolean;
	isAfterQuestion: boolean;
	hasGameStarted: boolean;
	isAutomatic: boolean;
	hint: string | null;
	isPaused: boolean;
}

const mapStateToProps = (state: State) => ({
	role: state.room.role,
	areStakesVisible: state.room.stakes.areVisible,
	isAfterQuestion: state.room.stage.isAfterQuestion,
	hasGameStarted: state.room.stage.isGameStarted,
	isAutomatic: state.game.isAutomatic,
	hint: state.room.hint,
	isPaused: state.room.stage.isGamePaused,
});

function renderBody(props: TableContextViewProps, contextView: ContextView, windowWidth: number, tableMode: TableMode) : JSX.Element | null {
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

	if (!props.hasGameStarted && !props.isAutomatic && props.role !== Role.Viewer) {
		return <ReadyButton />;
	}

	if (props.areStakesVisible) {
		return <StakePanel />;
	}

	const defaultView = props.role === Role.Showman ? <div className='emptyContext' /> : null;

	if (props.isAfterQuestion && props.role === Role.Player) {
		return <ReactionPanel />;
	}

	if (props.role === Role.Player) {
		return <PlayerButtonsPanel />;
	}

	if (props.hint && windowWidth < 800) {
		return <GameHint />;
	}

	if (props.isPaused && props.role === Role.Showman && tableMode === TableMode.RoundTable) {
		return <EditTableButton />;
	}

	return defaultView;
}

export function TableContextView(props: TableContextViewProps): JSX.Element | null {
	const state = useAppSelector((rootState: RootState) => rootState.room2);
	const ui = useAppSelector(rootState => rootState.ui);
	const table = useAppSelector(rootState => rootState.table);
	const body = renderBody(props, state.contextView, ui.windowWidth, table.mode);
	return body == null ? null : <div className='tableContextView'>{body}</div>;
}

export default connect(mapStateToProps)(TableContextView);