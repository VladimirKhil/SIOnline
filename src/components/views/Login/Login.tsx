import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../model/enums/Constants';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import actionCreators from '../../../logic/actionCreators';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
import AvatarView from '../../panels/AvatarView/AvatarView';
import SexView from '../../panels/SexView/SexView';
import LanguageView from '../../panels/LanguageView/LanguageView';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { AppDispatch, RootState } from '../../../state/store';
import { changeLogin } from '../../../state/userSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import { validateLoginName } from '../../../utils/loginValidation';

import './Login.scss';

interface LoginProps {
	login: string;
	culture: string;

	onLogin: (appDispatch: AppDispatch) => void;
}

const mapStateToProps = (state: State) => ({
	login: state.user.login,
	culture: state.settings.appSettings.culture || localization.getLanguage(),
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onLogin: (appDispatch: AppDispatch) => {
		dispatch(actionCreators.login(appDispatch) as unknown as Action);
	},
});

export function Login(props: LoginProps) {
	const loginState = useAppSelector((state: RootState) => state.login);
	const appDispatch = useAppDispatch();
	const [tempLogin, setTempLogin] = React.useState('');

	// Initialize temp login from props
	React.useEffect(() => {
		setTempLogin(props.login);
	}, [props.login]);

	const onLoginChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setTempLogin(newValue);
	};

	const signIn = () => {
		const validationError = validateLoginName(tempLogin);

		if (validationError) {
			appDispatch(userErrorChanged(validationError));
			return;
		}

		// Update Redux with trimmed value before proceeding
		const trimmedLogin = tempLogin.trim();
		appDispatch(changeLogin(trimmedLogin));

		// Update local state to match
		setTempLogin(trimmedLogin);

		props.onLogin(appDispatch);
	};

	const onLoginKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			signIn();
		}
	};

	// Check if login button should be disabled
	const isLoginDisabled = () => loginState.inProgress || validateLoginName(tempLogin) !== null;

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
		<div id="logon" className='login'>
			<div className="main">
				<header>
					<div className='left'>
						<h1>{localization.appName}</h1>
					</div>

					<div className='right'>
						<LanguageView disabled={loginState.inProgress} />
					</div>
				</header>

				<div className='loginBody'>
					{loginState.inProgress ? <ProgressBar isIndeterminate /> : null}
					<p className='app-tagline'>{localization.appTagline}</p>
					<AvatarView disabled={loginState.inProgress} />
					<SexView disabled={loginState.inProgress} />

					<input
						className='login_name'
						name="name"
						type='text'
						placeholder={localization.yourName}
						title={localization.yourName}
						autoFocus
						value={tempLogin}
						autoComplete='on'
						maxLength={30}
						disabled={loginState.inProgress}
						onChange={onLoginChanged}
						onKeyDown={onLoginKeyPress}
					/>

					<button
						className='standard enter'
						type="button"
						disabled={isLoginDisabled()}
						onClick={signIn}>
						{localization.enter}
					</button>
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
