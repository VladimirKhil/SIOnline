import ServerInfo from './contracts/ServerInfo';
import localization from '../model/resources/localization';

// This is a backup server discovery URI. If the main one fails, we can try this one.
const alternativeServerDiscoveryUri = 'https://server2.vladimirkhil.com/api/si/servers/';

async function getServerInfoFromUri(serverDiscoveryUri: string): Promise<ServerInfo> {
	// Using random number to prevent serverUri caching
	const serverUrisResponse = await fetch(`${serverDiscoveryUri}?r=${Math.random()}`); // throwing TypeError here is ok

	if (!serverUrisResponse.ok) {
		throw new Error(localization.formatString(
			localization.serverDiscoveryBroken,
			serverUrisResponse.status.toString(),
			await serverUrisResponse.text()) as string);
	}

	const serverUris = (await serverUrisResponse.json()) as ServerInfo[];

	if (!serverUris || serverUris.length === 0) {
		throw new Error(localization.serverUrisBroken);
	}

	return serverUris[0];
}

export default async function getServerInfo(serverDiscoveryUri: string): Promise<ServerInfo> {
	try {
		return await getServerInfoFromUri(alternativeServerDiscoveryUri);
	} catch (alternativeError) {
		if (serverDiscoveryUri === alternativeServerDiscoveryUri) {
			throw alternativeError;
		}

		try {
			return await getServerInfoFromUri(serverDiscoveryUri);
		} catch (primaryError) {
			const alternativeMessage = alternativeError instanceof Error ? alternativeError.message : String(alternativeError);
			const primaryMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
			const errorMessage = localization.formatString(
				localization.serverDiscoveryDoubleError,
				alternativeServerDiscoveryUri,
				alternativeMessage,
				serverDiscoveryUri,
				primaryMessage
			) as string;

			throw new Error(errorMessage);
		}
	}
}