import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import Role from '../../../client/contracts/Role';
import StakePanel from '../stakes/StakePanel/StakePanel';
import ReactionPanel from '../ReactionPanel/ReactionPanel';
import AnswerInput from '../AnswerInput';
import PlayerButtonsPanel from '../PlayerButtonsPanel/PlayerButtonsPanel';
import ReadyButton from '../ReadyButton/ReadyButton';

import './TableContextView.css';

interface TableContextViewProps {
	role: Role;
	areStakesVisible: boolean;
	isAfterQuestion: boolean;
	isAnswering: boolean;
	hasGameStarted: boolean;
	isAutomatic: boolean;
}

const mapStateToProps = (state: State) => ({
	role: state.room.role,
	areStakesVisible: state.room.stakes.areVisible,
	isAfterQuestion: state.room.stage.isAfterQuestion,
	isAnswering: state.room.stage.isAnswering,
	hasGameStarted: state.room.stage.isGameStarted,
	isAutomatic: state.game.isAutomatic,
});

function renderBody(props: TableContextViewProps) : JSX.Element | null {
	// TODO: Switch to enum to select view to displaty

	if (!props.hasGameStarted && !props.isAutomatic && props.role !== Role.Viewer) {
		return <ReadyButton />;
	}

	if (props.areStakesVisible) {
		return <StakePanel />;
	}

	if (props.isAfterQuestion) {
		return props.role === Role.Player ? <ReactionPanel /> : null;
	}

	if (props.isAnswering) {
		return <AnswerInput id="answerBoxWide" />;
	}

	return props.role === Role.Player ? (<PlayerButtonsPanel />) : null;
}

export function TableContextView(props: TableContextViewProps): JSX.Element | null {
	return (<div className='tableContextView'>{renderBody(props)}</div>);
}

export default connect(mapStateToProps)(TableContextView);