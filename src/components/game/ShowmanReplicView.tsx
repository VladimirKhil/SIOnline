import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';

import './ShowmanReplicView.css';
import AutoSizedText from '../autoSizedText/AutoSizedText';

interface ShowmanReplicViewProps {
	replic: string | null;
	decisionNeeded: boolean;
}

const mapStateToProps = (state: State) => ({
	replic: state.run.persons.showman.replic,
	decisionNeeded: state.run.stage.isDecisionNeeded
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function ShowmanReplicView(props: ShowmanReplicViewProps) {
	return <AutoSizedText id="showmanReplic" className={props.decisionNeeded ? 'highlighted' : ''}
		text={props.replic || ''} maxFontSize={36} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowmanReplicView);
