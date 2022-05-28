import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import Account from '../../model/Account';
import runActionCreators from '../../state/run/runActionCreators';
import PersonView from './PersonView';

import './PersonsView.css';

interface PersonsViewProps {
	isConnected: boolean;
	showman: Account | undefined;
	players: Account[];
	viewers: Account[];
	login: string;
	selectedPerson: Account | null;
	kick: () => void;
	ban: () => void;
}

const mapStateToProps = (state: State) => {
	const showman = state.run.persons.all[state.run.persons.showman.name];
	const playersNames = state.run.persons.players.map(p => p.name);

	const players = playersNames
		.map(name => state.run.persons.all[name])
		.filter(p => p)
		.sort((p1, p2) => p1.name.localeCompare(p2.name));

	const viewers = Object.keys(state.run.persons.all)
		.filter(name => name !== state.run.persons.showman.name && !playersNames.includes(name))
		.map(name => state.run.persons.all[name])
		.sort((p1, p2) => p1.name.localeCompare(p2.name));

	const { selectedPersonName } = state.run.chat;

	return {
		isConnected: state.common.isConnected,
		showman,
		players,
		viewers,
		login: state.user.login,
		selectedPerson: selectedPersonName ? state.run.persons.all[selectedPersonName] : null
	};
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
	kick: () => {
		dispatch((runActionCreators.kickPerson() as object) as AnyAction);
	},
	ban: () => {
		dispatch((runActionCreators.banPerson() as object) as AnyAction);
	}
});

const tooltipRef: React.RefObject<HTMLDivElement> = React.createRef();

function inviteLink() {
	navigator.clipboard.writeText(window.location.href + '&invite=true');

	if (tooltipRef.current) {
		tooltipRef.current.style.display = 'initial';

		setTimeout(
			() => {
				if (tooltipRef.current) {
					tooltipRef.current.style.display = 'none';
				}
			},
			3000
		);
	}
}

export function PersonsView(props: PersonsViewProps): JSX.Element {
	const canKick = props.selectedPerson && props.selectedPerson.name !== props.login && props.selectedPerson.isHuman;

	return (
		<>
			<div className="personsList">
				<div className="personsHeader">{localization.showman}</div>
				{props.showman ? (
					<ul>
						<PersonView account={props.showman} />
					</ul>
				) : null}
				<div className="personsHeader">{localization.players}</div>
				<ul>
					{props.players.map((person, index) => (
						<PersonView key={person ? person.name : index} account={person} />
					))}
				</ul>
				<div className="personsHeader">{localization.viewers}</div>
				<ul>
					{props.viewers.map(person => <PersonView key={person.name} account={person} />)}
				</ul>
			</div>
			<div className="buttonsPanel inviteLinkHost">
				<button type="button" onClick={() => inviteLink()}>{localization.inviteLink}</button>
				<div ref={tooltipRef} className='inviteLinkTooltip'>{localization.inviteLinkCopied}</div>
			</div>
			<div className="buttonsPanel">
				<button type="button" onClick={() => props.kick()} disabled={!props.isConnected || !canKick}>{localization.kick}</button>
				<button type="button" onClick={() => props.ban()} disabled={!props.isConnected || !canKick}>{localization.ban}</button>
			</div>
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonsView);
