import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';
import Account from '../../model/Account';

import './ShowmanReplicView.css';

interface ShowmanReplicViewProps {
	replic: string | null;
	account: Account;
	decisionNeeded: boolean;
}

const mapStateToProps = (state: State) => ({
	replic: state.run.persons.showman.replic,
	account: state.run.persons.all[state.run.persons.showman.name],
	decisionNeeded: state.run.stage.isDecisionNeeded
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function ShowmanReplicView(props: ShowmanReplicViewProps) {
	return (
		<div className={`showmanArea ${props.decisionNeeded ? 'highlighted' : ''}`}>
			<div className="showmanInfo">
				{props.account && props.account.avatar ? <div className="showmanAvatar"><img src={props.account.avatar} /></div> : null}
				<div className="showmanName">{props.account?.name}</div>
			</div>
			<AutoSizedText id="showmanReplic" text={props.replic || ''} maxFontSize={48} />
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowmanReplicView);
