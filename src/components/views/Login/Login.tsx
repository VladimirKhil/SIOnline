import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../model/enums/Constants';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import actionCreators from '../../../logic/actionCreators';
import ProgressBar from '../../common/ProgressBar';
import AvatarView from '../../AvatarView';
import SexView from '../../SexView';
import LanguageView from '../../LanguageView';
import Path from '../../../model/enums/Path';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import { AppDispatch, RootState } from '../../../state/new/store';
import { changeLogin } from '../../../state/new/userSlice';
import { navigate } from '../../../utils/Navigator';

import './Login.scss';

interface LoginProps {
	login: string;
	culture: string;

	selectedGameId: number;
	onLogin: (appDispatch: AppDispatch) => void;
}

const mapStateToProps = (state: State) => ({
	login: state.user.login,
	culture: state.settings.appSettings.culture || localization.getLanguage(),

	selectedGameId: state.online.selectedGameId,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onLogin: (appDispatch: AppDispatch) => {
		dispatch(actionCreators.login(appDispatch) as unknown as Action);
	},
});

export function Login(props: LoginProps) {
	const state = useAppSelector((rootState: RootState) => rootState.login);
	const appDispatch = useAppDispatch();

	const onLoginChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(changeLogin(e.target.value));
	};

	const login = () => props.onLogin(appDispatch);

	const onLoginKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			login();
		}
	};

	const navigateToAbout = () => appDispatch(navigate({ navigation: { path: Path.About }, saveState: true }));

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
				<header>
					<div className='left'>
						<h1>{localization.appName}</h1>
					</div>

					<div className='right'>
						<button
							className='howToPlay'
							type="button"
							title={localization.aboutTitle}
							disabled={state.inProgress}
							onClick={navigateToAbout}>
							ⓘ
						</button>

						<LanguageView disabled={state.inProgress} />
					</div>
				</header>

				<div className='loginBody'>
					{state.inProgress ? <ProgressBar isIndeterminate /> : null}
					<AvatarView disabled={state.inProgress} />
					<SexView disabled={state.inProgress} />

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
						disabled={state.inProgress}
						onChange={onLoginChanged}
						onKeyPress={onLoginKeyPress}
					/>

					<button
						className='standard enter'
						type="button"
						disabled={state.inProgress || props.login.length === 0}
						onClick={login}>
						{localization.enter}
					</button>
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
