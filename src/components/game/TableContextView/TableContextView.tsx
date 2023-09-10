import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import Role from '../../../client/contracts/Role';
import StakePanel from '../stakes/StakePanel/StakePanel';
import ReactionPanel from '../ReactionPanel/ReactionPanel';
import AnswerInput from '../AnswerInput';
import PlayerButtonsPanel from '../PlayerButtonsPanel/PlayerButtonsPanel';

import './TableContextView.css';

interface TableContextViewProps {
	role: Role;
	areStakesVisible: boolean;
	isAfterQuestion: boolean;
	isAnswering: boolean;
}

const mapStateToProps = (state: State) => ({
	role: state.room.role,
	areStakesVisible: state.room.stakes.areVisible,
	isAfterQuestion: state.room.stage.isAfterQuestion,
	isAnswering: state.room.stage.isAnswering,
});

function renderBody(props: TableContextViewProps) : JSX.Element | null {
	if (props.areStakesVisible) {
		return <StakePanel />;
	}

	if (props.isAfterQuestion) {
		return <ReactionPanel />;
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