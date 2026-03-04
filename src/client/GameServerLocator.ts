import ServerInfo from './contracts/ServerInfo';

// This is a backup server discovery URI. If the main one fails, we can try this one.
const alternativeServerDiscoveryUri = 'https://server2.vladimirkhil.com/api/si/servers/';

async function getServerInfoFromUri(serverDiscoveryUri: string): Promise<ServerInfo> {
	// Using random number to prevent serverUri caching
	const serverUrisResponse = await fetch(`${serverDiscoveryUri}?r=${Math.random()}`); // throwing TypeError here is ok

	if (!serverUrisResponse.ok) {
		throw new Error(`Server discovery is broken: ${serverUrisResponse.status} ${await serverUrisResponse.text()}`);
	}

	const serverUris = (await serverUrisResponse.json()) as ServerInfo[];

	if (!serverUris || serverUris.length === 0) {
		throw new Error('Server uris object is broken');
	}

	return serverUris[0];
}

export default async function getServerInfo(serverDiscoveryUri: string): Promise<ServerInfo> {
	try {
		return await getServerInfoFromUri(serverDiscoveryUri);
	} catch (primaryError) {
		if (serverDiscoveryUri === alternativeServerDiscoveryUri) {
			throw primaryError;
		}

		try {
			return await getServerInfoFromUri(alternativeServerDiscoveryUri);
		} catch (alternativeError) {
			const primaryMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
			const alternativeMessage = alternativeError instanceof Error ? alternativeError.message : String(alternativeError);
			const errorMessage =
				'Server discovery failed for both endpoints. ' +
				`Primary (${serverDiscoveryUri}): ${primaryMessage}. ` +
				`Alternative (${alternativeServerDiscoveryUri}): ${alternativeMessage}`;

			throw new Error(errorMessage);
		}
	}
}