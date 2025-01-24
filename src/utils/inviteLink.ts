import localization from '../model/resources/localization';
import { userInfoChanged } from '../state/commonSlice';
import { AppDispatch } from '../state/store';

export default function inviteLink(appDispatch: AppDispatch) {
	const link = window.location.href;

	if (navigator.clipboard) {
		navigator.clipboard.writeText(link);
	} else {
		alert(link);
	}

	appDispatch(userInfoChanged(localization.inviteLinkCopied));
}