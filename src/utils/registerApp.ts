import AppRegistryClient from 'appregistry-client';
import Architecture from 'appregistry-client/dist/requests/Architecture';

let isRegistered = false;

export default async function registerApp(appRegistryServiceUri: string) {
	if (isRegistered || !appRegistryServiceUri) {
		return;
	}

	isRegistered = true;

	try {
		const appRegistryClient = new AppRegistryClient({ serviceUri: appRegistryServiceUri });

		await appRegistryClient.postAppUsageAsync('1d83d2b8-908f-422f-b3de-4febf96f9665', {
			appVersion: '8.0.0',
			osArchitecture: Architecture.X64,
			osVersion: '10.0.0'
		});
	} catch (e) {
		console.log(e);
	}
}