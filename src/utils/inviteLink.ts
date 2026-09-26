import localization from '../model/resources/localization';
import { userInfoChanged } from '../state/commonSlice';
import { copyUriToClipboard } from '../state/globalActions';
import { AppDispatch } from '../state/store';

export default function inviteLink(appDispatch: AppDispatch) {
	appDispatch(copyUriToClipboard());
	appDispatch(userInfoChanged(localization.inviteLinkCopied));
}

/** Builds the query part of the room link. Rooms on known SIGame hosts get a short link. */
export function getGameLink(gameId: number, hostUri: string | undefined, siHosts: Record<string, string>): string {
	for (const [key, value] of Object.entries(siHosts)) {
		if (value === hostUri) {
			return '_' + key + gameId;
		}
	}

	return `gameId=${gameId}&host=${encodeURIComponent(hostUri ?? '')}`;
}