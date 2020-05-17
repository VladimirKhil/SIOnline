import * as React from 'react';
import Sex from '../model/enums/Sex';
import Constants from '../model/enums/Constants';
import localization from '../model/resources/localization';
import State from '../state/State';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import ProgressBar from './common/ProgressBar';

import './Login.css';

interface LoginProps {
	login: string;
	sex: Sex;
	inProgress: boolean;
	error: string | null;
	ads?: string;
	onLoginChanged: (newLogin: string) => void;
	onSexChanged: (newSex: Sex) => void;
	onHowToPlay: () => void;
	onLogin: () => void;
}

const mapStateToProps = (state: State) => ({
	login: state.user.login,
	sex: state.user.sex,
	inProgress: state.login.inProgress,
	error: state.login.errorMessage,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onHowToPlay: () => {
		dispatch(actionCreators.navigateToHowToPlay());
	},
	onLoginChanged: (newLogin: string) => {
		dispatch(actionCreators.onLoginChanged(newLogin));
	},
	onSexChanged: (newSex: Sex) => {
		dispatch(actionCreators.onSexChanged(newSex));
	},
	onLogin: () => {
		dispatch(actionCreators.login() as object as Action); // TODO: разобраться с типизацией
	}
});

export class Login extends React.Component<LoginProps> {
	constructor(props: LoginProps) {
		super(props);
	}

	private onLoginChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onLoginChanged(e.target.value);
	}

	private onSexChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onSexChanged(e.target.id === 'male' && e.target.checked ? Sex.Male : Sex.Female);
	}

	private onLoginKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.charCode === Constants.KEY_ENTER) {
			this.props.onLogin();
		}
	}

	render() {
		return (
			<div id="logon">
				<div className="main">
					{this.props.inProgress ? <ProgressBar /> : null}
					<header><h1>{localization.appName}</h1></header>
					<div className="logonHost">
						<p className="header">{localization.yourName}</p>
						<input id="entername" name="name" autoFocus value={this.props.login} maxLength={30} disabled={this.props.inProgress}
							onChange={this.onLoginChanged} onKeyPress={this.onLoginKeyPress} />

						<p className="header">{localization.sex}</p>
						<div className="sexLogin">
							<input type="radio" id="male" name="sex" disabled={this.props.inProgress}
								checked={this.props.sex === Sex.Male} onChange={this.onSexChanged} />
							<label htmlFor="male">{localization.male}</label>
							<input type="radio" id="female" name="sex" disabled={this.props.inProgress}
								checked={this.props.sex === Sex.Female} onChange={this.onSexChanged} />
							<label htmlFor="female">{localization.female}</label>
						</div>

						<div className="siAdHost" dangerouslySetInnerHTML={{ __html: this.props.ads ? this.props.ads : '' }} />

						{this.props.error ? <p id="logonerror">{this.props.error}</p> : null}
						<div id="logonButtons">
							<button id="howToPlay" disabled={this.props.inProgress} onClick={this.props.onHowToPlay}>{localization.howToPlay}</button>
							<button id="enter" disabled={this.props.inProgress || this.props.login.length === 0} onClick={this.props.onLogin}>{localization.enter}</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const loginHOC = connect(mapStateToProps, mapDispatchToProps)(Login);

export default loginHOC;
