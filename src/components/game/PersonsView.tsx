import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import { Dispatch, Action, AnyAction } from 'redux';
import Account from '../../model/Account';
import runActionCreators from '../../state/run/runActionCreators';

import './PersonsView.css';

interface PersonsViewProps {
	persons: Account[];
	login: string;
	selectedPersonName: string | null;
	selectPerson: (account: Account) => void;
	kick: () => void;
	ban: () => void;
}

const mapStateToProps = (state: State) => {
	const result = Object.values(state.run.persons.all);

	return {
		persons: result.sort((p1, p2) => p1.name.localeCompare(p2.name)),
		login: state.user.login,
		selectedPersonName: state.run.chat.selectedPersonName
	};
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	kick: () => {
		dispatch((runActionCreators.kickPerson() as object) as AnyAction);
	},
	ban: () => {
		dispatch((runActionCreators.banPerson() as object) as AnyAction);
	},
	selectPerson: (account: Account) => {
		dispatch(runActionCreators.chatPersonSelected(account.name));
	}
});

// tslint:disable-next-line: function-name
export function PersonsView(props: PersonsViewProps) {
	const selectedPerson = props.persons.find(p => p.name === props.selectedPersonName);

	const canKick = selectedPerson
		&& selectedPerson.name !== props.login
		&& selectedPerson.isHuman;

	return (
		<React.Fragment>
			<ul id="personsList">
				{props.persons.map(person => (
					<li key={person.name}
					className={(person.name === props.selectedPersonName ? 'active ' : '') + (person.name === props.login ? 'me' : '')}
					onClick={() => props.selectPerson(person)}>{person.name}</li>
				))}
			</ul>
			<div className="buttonsPanel">
				<button onClick={() => props.kick()} disabled={!canKick}>{localization.kick}</button>
				<button onClick={() => props.ban()} disabled={!canKick}>{localization.ban}</button>
			</div>
		</React.Fragment>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonsView);
