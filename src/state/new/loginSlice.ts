import * as signalR from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GameServerClient from '../../client/GameServerClient';
import DataContext from '../../model/DataContext';
import MainView from '../../model/enums/MainView';
import localization from '../../model/resources/localization';
import { activeConnections, attachListeners } from '../../utils/ConnectionHelpers';
import getErrorMessage from '../../utils/ErrorHelpers';
import { computerAccountsChanged, serverNameChanged } from './commonSlice';
import { saveStateToStorage } from './StateHelpers';
import { AppDispatch, RootState } from './store';
import { navigate } from './uiSlice';
import { changeLogin } from './userSlice';

interface LoginState {
	inProgress: boolean;
	errorMessage: string;
}

const initialState: LoginState = {
	inProgress: false,
	errorMessage: ''
};

export const loginSlice = createSlice({
	name: 'login',
	initialState,
	reducers: {
		startLogin: (state: LoginState) => {
			state.inProgress = true;
			state.errorMessage = '';
		},		
		endLogin: (state: LoginState, action: PayloadAction<string>) => {
			state.inProgress = false;
			state.errorMessage = action.payload;
		}
	}
});

export const {
	startLogin,
	endLogin
} = loginSlice.actions;

function getLoginErrorByCode(response: Response): string {
	switch (response.status) {
		case 0:
			return localization.cannotConnectToServer;

		case 403:
			return localization.forbiddenNickname;

		case 409:
			return localization.duplicateUserName;

		default:
			return response.statusText;
	}
}

async function loadHostInfoAsync(dispatch: AppDispatch, dataContext: DataContext) {
	const hostInfo = await dataContext.gameClient.getGameHostInfoAsync();

	dataContext.contentUris = hostInfo.contentPublicBaseUrls;

	dispatch(serverNameChanged(hostInfo.name));
}

export const login = () => async (dispatch: AppDispatch, getState: () => RootState, dataContext: DataContext) : Promise<void> => {
	dispatch(startLogin());

	const state = getState();

	try {
		const response = await fetch(`${dataContext.serverUri}/api/Account/LogOn`, {
			method: 'POST',
			credentials: 'include',
			body: `login=${state.user.login}&password=`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (response.ok) {
			saveStateToStorage(state);

			const token = await response.text();
			const queryString = `?token=${encodeURIComponent(token)}`;

			let connectionBuilder = new signalR.HubConnectionBuilder()
				.withAutomaticReconnect()
				.withUrl(`${dataContext.serverUri}/sionline${queryString}`);

			if (dataContext.config.useMessagePackProtocol) {
				connectionBuilder = connectionBuilder.withHubProtocol(new signalRMsgPack.MessagePackHubProtocol());
			}

			const connection = connectionBuilder.build();
			// eslint-disable-next-line no-param-reassign
			dataContext.connection = connection;
			// eslint-disable-next-line no-param-reassign
			dataContext.gameClient = new GameServerClient(connection);

			try {
				await dataContext.connection.start();

				if (dataContext.connection.connectionId) {
					activeConnections.push(dataContext.connection.connectionId);
				}

				attachListeners(dataContext.connection, dispatch);

				const computerAccounts = await dataContext.gameClient.getComputerAccountsAsync();
				dispatch(computerAccountsChanged(computerAccounts));

				dispatch(endLogin(''));
				dispatch(changeLogin(state.user.login.trim())); // Normalize login

				await loadHostInfoAsync(dispatch, dataContext);
				dispatch(navigate(MainView.Welcome));
			} catch (error) {
				dispatch(endLogin(`${localization.cannotConnectToServer}: ${getErrorMessage(error)}`));
			}
		} else {
			const errorText = getLoginErrorByCode(response);
			dispatch(endLogin(errorText));
		}
	} catch (err) {
		dispatch(endLogin(`${localization.cannotConnectToServer}: ${getErrorMessage(err)}`));
	}
};

export default loginSlice.reducer;