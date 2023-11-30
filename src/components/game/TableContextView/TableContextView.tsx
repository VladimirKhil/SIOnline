import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import Role from '../../../model/Role';
import StakePanel from '../stakes/StakePanel/StakePanel';
import ReactionPanel from '../ReactionPanel/ReactionPanel';
import AnswerInput from '../AnswerInput';
import PlayerButtonsPanel from '../PlayerButtonsPanel/PlayerButtonsPanel';
import ReadyButton from '../ReadyButton/ReadyButton';
import GameHint from '../GameHint';

import './TableContextView.css';

interface TableContextViewProps {
	role: Role;
	areStakesVisible: boolean;
	isAfterQuestion: boolean;
	isAnswering: boolean;
	hasGameStarted: boolean;
	isAutomatic: boolean;
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	role: state.room.role,
	areStakesVisible: state.room.stakes.areVisible,
	isAfterQuestion: state.room.stage.isAfterQuestion,
	isAnswering: state.room.stage.isAnswering,
	hasGameStarted: state.room.stage.isGameStarted,
	isAutomatic: state.game.isAutomatic,
	hint: state.room.hint,
});

function renderBody(props: TableContextViewProps) : JSX.Element | null {
	// TODO: Switch to enum to select view to displaty

	if (!props.hasGameStarted && !props.isAutomatic && props.role !== Role.Viewer) {
		return <ReadyButton />;
	}

	if (props.areStakesVisible) {
		return <StakePanel />;
	}

	if (props.isAnswering) {
		return <AnswerInput id="answerBoxWide" />;
	}

	if (props.isAfterQuestion) {
		return props.role === Role.Player ? <ReactionPanel /> : null;
	}

	if (props.role === Role.Player) {
		return <PlayerButtonsPanel />;
	}

	if (props.hint) {
		return <GameHint />;
	}

	return null;
}

export function TableContextView(props: TableContextViewProps): JSX.Element | null {
	const body = renderBody(props);
	return body == null ? null : <div className='tableContextView'>{body}</div>;
}

export default connect(mapStateToProps)(TableContextView);