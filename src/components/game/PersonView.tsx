import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import Account from '../../model/Account';
import Sex from '../../model/enums/Sex';
import localization from '../../model/resources/localization';
import runActionCreators from '../../state/run/runActionCreators';
import State from '../../state/State';

import './PersonView.css';

interface PersonViewProps {
	account: Account;
	selectedPersonName: string | null;
	login: string;
	selectPerson: (name: string) => void;
}

const mapStateToProps = (state: State) => ({
	selectedPersonName: state.run.chat.selectedPersonName,
	login: state.user.login,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
	selectPerson: (name: string) => {
		dispatch(runActionCreators.chatPersonSelected(name));
	}
});

export function PersonView(props: PersonViewProps): JSX.Element {
	const isActive = props.account.name === props.selectedPersonName;
	const isMe = props.account.name === props.login;

	const humanImage = props.account.sex === Sex.Male ? '🧑' : '👩';

	return (
		<li className={`personItem ${isActive ? 'active ' : ''} ${isMe ? 'me' : ''}`}
			onClick={() => props.selectPerson(props.account.name)}>
			<span title={props.account.isHuman ? localization.human : localization.computer}>
				{props.account.isHuman ? humanImage : '🖥️'}
			</span>
			<div
				className="personItem_avatar"
				style={{ backgroundImage: props.account.avatar ? `url(${props.account.avatar})` : undefined }}
			/>
			<span>
				{props.account.name}
			</span>
		</li>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonView);
