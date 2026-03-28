import SIContentClient, { SIContentServiceError } from 'sicontent-client';
import SIStorageClient from 'sistorage-client';
import DataContext from '../model/DataContext';
import State from '../state/State';
import { AppDispatch } from '../state/store';
import { getFullCulture } from '../utils/StateHelpers';
import SIStorageInfo from '../client/contracts/SIStorageInfo';
import { computerAccountsChanged, serverInfoChanged, avatarLoadEnd, avatarLoadStart, userErrorChanged, avatarLoadError } from '../state/commonSlice';
import { setStorages } from '../state/siPackagesSlice';
import Constants from '../model/enums/Constants';
import registerApp from '../utils/registerApp';
import getServerInfo from '../client/GameServerLocator';
import getErrorMessage from '../utils/ErrorHelpers';
import { changeAvatar } from '../state/userSlice';
import WellKnownSIContentServiceErrorCode from 'sicontent-client/dist/models/WellKnownSIContentServiceErrorCode';
import localization from '../model/resources/localization';

function createStorageClientFromInfo(storageInfo: SIStorageInfo): SIStorageClient {
	return new SIStorageClient({
		serviceUri: storageInfo.serviceUri,
	});
}

async function uploadAvatarAsync(appDispatch: AppDispatch, dataContext: DataContext) {
	if (typeof localStorage === 'undefined') {
		return;
	}

	const base64 = localStorage.getItem(Constants.AVATAR_KEY);
	const fileName = localStorage.getItem(Constants.AVATAR_NAME_KEY);

	if (!base64 || !fileName) {
		return;
	}

	try {
		appDispatch(avatarLoadStart());

		const bin = window.atob(base64);
		const buffer = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) {
			buffer[i] = bin.charCodeAt(i);
		}

		const { contentClients } = dataContext;

		if (!contentClients || contentClients.length === 0) {
			console.log('No SIContent service available for avatar upload');
			appDispatch(avatarLoadEnd());
			return;
		}

		const contentIndex = Math.floor(Math.random() * contentClients.length);
		const contentClient = contentClients[contentIndex];

		const avatarUri2 = await contentClient.uploadAvatarIfNotExistAsync(fileName, new Blob([buffer]));

		const fullAvatarUri2 = avatarUri2.startsWith('/')
			? contentClient.options.serviceUri + avatarUri2.substring(1)
			: avatarUri2;

		appDispatch(avatarLoadEnd());
		appDispatch(changeAvatar(fullAvatarUri2));
	} catch (err) {
		const errorMessage = getErrorMessage(err);

		const userError = (err as SIContentServiceError).errorCode === WellKnownSIContentServiceErrorCode.FileTooLarge
			? localization.fileIsTooBig
			: errorMessage;

		appDispatch(userErrorChanged(localization.avatarLoadError + ': ' + userError) as any);
		appDispatch(avatarLoadError(errorMessage));
	}
}

async function loadHostInfoAsync(appDispatch: AppDispatch, dataContext: DataContext, culture: string) {
	const [hostInfo, computerAccounts] = await Promise.all([
		dataContext.gameClient.getGameHostInfoAsync(culture),
		dataContext.gameClient.getComputerAccountsAsync(culture)
	]);

	// eslint-disable-next-line no-param-reassign
	dataContext.contentUris = hostInfo.contentPublicBaseUrls;

	const { contentInfos } = hostInfo;
	let { storageInfos } = hostInfo;

	if (storageInfos && storageInfos.length === 0 && culture !== 'en-US') {
		const englishHostInfo = await dataContext.gameClient.getGameHostInfoAsync('en-US');
		storageInfos = englishHostInfo.storageInfos;
	}

	if (contentInfos && contentInfos.length > 0) {
		dataContext.contentClients = contentInfos.map(info => new SIContentClient({
			serviceUri: info.serviceUri,
		}));
	} else {
		throw new Error('No SIContent service found');
	}

	dataContext.storageClients = storageInfos.map(createStorageClientFromInfo);
	const { storageClient, storageInfo } = dataContext.host.getStorage();

	if (storageClient && storageInfo) {
		dataContext.storageClients.push(storageClient);
		storageInfos.push(storageInfo);
	}

	appDispatch(setStorages(storageInfos));

	appDispatch(serverInfoChanged({
		serverName: hostInfo.name,
		serverLicense: hostInfo.license,
		maxPackageSizeMb: hostInfo.maxPackageSizeMb,
		siHosts: hostInfo.siHosts,
	}));

	appDispatch(computerAccountsChanged(computerAccounts));

	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(Constants.LICENSE_TEXT_KEY, hostInfo.license);
	}
}

export async function ensureServerInfoLoadedAsync(
	appDispatch: AppDispatch,
	getState: () => State,
	dataContext: DataContext
) {
	const state = getState();

	if (!dataContext.serverUri) {
		const { serverDiscoveryUri } = dataContext.config;

		if (serverDiscoveryUri) {
			try {
				const { uri, proxyUri: serverProxyUri } = await getServerInfo(serverDiscoveryUri);
				dataContext.serverUri = uri;
				dataContext.proxyUri = serverProxyUri;
				dataContext.gameClient.setServerUri(uri);
			} catch (error) {
				console.error('Failed to fetch server info: ' + getErrorMessage(error));
				return;
			}
		} else {
			return;
		}
	}

	if (dataContext.serverUri) {
		const requestCulture = getFullCulture(state);

		await loadHostInfoAsync(appDispatch, dataContext, requestCulture);
		await uploadAvatarAsync(appDispatch, dataContext);

		await registerApp(dataContext.config.appRegistryServiceUri);

		dataContext.host.onReady();
	}
}
