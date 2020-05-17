import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import runActionCreators from '../../state/run/runActionCreators';
import Dialog from '../common/Dialog';
import PersonsView from './PersonsView';

import './PersonsDialog.css';

interface PersonsDialogProps {
	isCompact: boolean;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({

});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onClose: () => {
		dispatch(runActionCreators.runHidePersons());
	}
});

export class PersonsDialog extends React.Component<PersonsDialogProps> {
	constructor(props: PersonsDialogProps) {
		super(props);
	}

	render() {
		return (
			<Dialog id="personsDialog" title={localization.members} onClose={this.props.onClose}>
				<PersonsView />
			</Dialog>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonsDialog);
