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
import { ContextView } from '../../../state/room2Slice';
import ReportPanel from '../ReportPanel/ReportPanel';
import EditTableButton from '../EditTableButton/EditTableButton';
import TableMode from '../../../model/enums/TableMode';
import OralAnswer from '../OralAnswer/OralAnswer';
import AnswerValidationButtons from '../AnswerValidationButtons/AnswerValidationButtons';
import { DecisionType } from '../../../state/room2Slice';
import LayoutMode from '../../../model/enums/LayoutMode';
import localization from '../../../model/resources/localization';

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
	layoutMode: LayoutMode,
) : JSX.Element | null {
	switch (decisionType) {
		case DecisionType.Answer:
			if (layoutMode === LayoutMode.Simple) {
				return <AnswerInput />;
			}

			break;

		case DecisionType.Validation:
			if (role === Role.Player) {
				return <AnswerValidationButtons />;
			} else {
				return <div className='oral__answer'>{localization.validateAnswer}</div>;
			}

		case DecisionType.Review:
			return <ReportPanel />;

		default:
			break;
	}

	// TODO: Switch to enum to select view to display
	switch (contextView) {
		case ContextView.OralAnswer:
			return <OralAnswer />;

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
	const windowWidth = useAppSelector(rootState => rootState.ui.windowWidth);
	const tableMode = useAppSelector(rootState => rootState.table.mode);

	const { contextView, isGameStarted, isGamePaused, role, decisionType, layoutMode } = useAppSelector(rootState => ({
		contextView: rootState.room2.contextView,
		isGameStarted: rootState.room2.stage.isGameStarted,
		isGamePaused: rootState.room2.stage.isGamePaused,
		role: rootState.room2.role,
		decisionType: rootState.room2.stage.decisionType,
		layoutMode: rootState.table.layoutMode,
	}));

	const body = renderBody(
		props,
		contextView,
		windowWidth,
		tableMode,
		isGameStarted,
		isGamePaused,
		role,
		decisionType,
		layoutMode,
	);

	return body == null ? null : <div className='tableContextView'>{body}</div>;
}

export default connect(mapStateToProps)(TableContextView);