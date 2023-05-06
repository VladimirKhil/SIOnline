import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import Constants from '../model/enums/Constants';
import localization from '../model/resources/localization';
import State from '../state/State';
import actionCreators from '../state/actionCreators';
import ProgressBar from './common/ProgressBar';
import AvatarView from './AvatarView';
import SexView from './SexView';
import LanguageView from './LanguageView';
import userActionCreators from '../state/user/userActionCreators';
import uiActionCreators from '../state/ui/uiActionCreators';

import './Login.css';

interface LoginProps {
	login: string;
	inProgress: boolean;
	error: string | null;
	ads?: string;
	onLoginChanged: (newLogin: string) => void;
	onHowToPlay: () => void;
	onLogin: () => void;
}

const mapStateToProps = (state: State) => ({
	login: state.user.login,
	inProgress: state.login.inProgress,
	error: state.login.errorMessage,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onHowToPlay: () => {
		dispatch(uiActionCreators.navigateToHowToPlay());
	},
	onLoginChanged: (newLogin: string) => {
		dispatch(userActionCreators.onLoginChanged(newLogin));
	},
	onLogin: () => {
		dispatch(actionCreators.login() as unknown as Action); // TODO: разобраться с типизацией
	},
});

export class Login extends React.Component<LoginProps> {
	private onLoginChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onLoginChanged(e.target.value);
	};

	private onLoginKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			this.props.onLogin();
		}
	};

	render(): JSX.Element {
		return (
			<div id="logon">
				<div className="main">
					{this.props.inProgress ? <ProgressBar isIndeterminate /> : null}
					<div className='logo' />

					<div className="logonHost">
						<div className='loginUser'>
							<AvatarView disabled={this.props.inProgress} />

							<div className='userArea'>
								<input
									className='login_name'
									name="name"
									type='text'
									placeholder={localization.yourName}
									title={localization.yourName}
									autoFocus
									value={this.props.login}
									maxLength={30}
									disabled={this.props.inProgress}
									onChange={this.onLoginChanged}
									onKeyPress={this.onLoginKeyPress}
								/>

								<div className='loginOptions'>
									<LanguageView disabled={this.props.inProgress} />
									<SexView disabled={this.props.inProgress} />
								</div>
							</div>
						</div>

						<div className="siAdHost" dangerouslySetInnerHTML={{ __html: this.props.ads ? this.props.ads : '' }} />

						{this.props.error ? <p id="logonerror">{this.props.error}</p> : null}

						<div id="logonButtons">
							<button
								id="howToPlay"
								className='standard'
								type="button"
								disabled={this.props.inProgress}
								onClick={this.props.onHowToPlay}
							>
								{localization.aboutTitle}
							</button>

							<button
								id="enter"
								className='standard'
								type="button"
								disabled={this.props.inProgress || this.props.login.length === 0}
								onClick={this.props.onLogin}
							>
								{localization.enter}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
