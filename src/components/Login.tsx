import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Constants from '../model/enums/Constants';
import localization from '../model/resources/localization';
import State from '../state/State';
import actionCreators from '../logic/actionCreators';
import ProgressBar from './common/ProgressBar';
import AvatarView from './AvatarView';
import SexView from './SexView';
import LanguageView from './LanguageView';
import userActionCreators from '../state/user/userActionCreators';
import Path from '../model/enums/Path';
import uiActionCreators from '../state/ui/uiActionCreators';

import './Login.css';

interface LoginProps {
	login: string;
	inProgress: boolean;
	error: string | null;
	ads?: string;
	culture: string;

	selectedGameId: number;
	onLoginChanged: (newLogin: string) => void;
	onLogin: () => void;
	navigate: (path: Path) => void;
}

const mapStateToProps = (state: State) => ({
	login: state.user.login,
	inProgress: state.login.inProgress,
	error: state.login.errorMessage,
	culture: state.settings.appSettings.culture || localization.getLanguage(),
	navigation: state.ui.navigation,

	selectedGameId: state.online.selectedGameId,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onLoginChanged: (newLogin: string) => {
		dispatch(userActionCreators.onLoginChanged(newLogin));
	},
	onLogin: () => {
		dispatch(actionCreators.login() as unknown as Action);
	},
	navigate: (path: Path) => {
		dispatch(uiActionCreators.navigate({ path: path }) as unknown as Action);
	}
});

export function Login(props: LoginProps) {
	const onLoginChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onLoginChanged(e.target.value);
	};

	const onLoginKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			props.onLogin();
		}
	};

	const navigateToAbout = () => props.navigate(Path.About);

	const prevPropsRef = React.useRef<LoginProps>();

	React.useEffect(() => {
		prevPropsRef.current = prevPropsRef.current || props;
	});

	React.useEffect(() => {
		if (prevPropsRef.current && prevPropsRef.current.culture !== props.culture) {
			window.location.reload();
		}
	}, [props.culture]);

	return (
		<div id="logon">
			<div className="main">
				{props.inProgress ? <ProgressBar isIndeterminate /> : null}
				<div className='logo' />

				<div className="logonHost">
					<div className='loginUser'>
						<AvatarView disabled={props.inProgress} />

						<div className='userArea'>
							<input
								className='login_name'
								name="name"
								type='text'
								placeholder={localization.yourName}
								title={localization.yourName}
								autoFocus
								value={props.login}
								autoComplete='on'
								maxLength={30}
								disabled={props.inProgress}
								onChange={onLoginChanged}
								onKeyPress={onLoginKeyPress}
							/>

							<div className='loginOptions'>
								<LanguageView disabled={props.inProgress} />
								<SexView disabled={props.inProgress} />
							</div>
						</div>
					</div>

					<div className="siAdHost" dangerouslySetInnerHTML={{ __html: props.ads ? props.ads : '' }} />

					{props.error ? <p id="logonerror">{props.error}</p> : null}

					<div id="logonButtons">
						<button
							id="howToPlay"
							className='standard'
							type="button"
							disabled={props.inProgress}
							onClick={navigateToAbout}
						>
							{localization.aboutTitle}
						</button>

						<button
							id="enter"
							className='standard'
							type="button"
							disabled={props.inProgress || props.login.length === 0}
							onClick={props.onLogin}
						>
							{localization.enter}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
