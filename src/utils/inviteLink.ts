import localization from '../model/resources/localization';
import { userInfoChanged } from '../state/commonSlice';
import { copyToClipboard } from '../state/globalActions';
import { AppDispatch } from '../state/store';

export default function inviteLink(appDispatch: AppDispatch) {
	appDispatch(copyToClipboard(window.location.href));
	appDispatch(userInfoChanged(localization.inviteLinkCopied));
}