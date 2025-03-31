import localization from '../model/resources/localization';
import { userInfoChanged } from '../state/commonSlice';
import { copyUriToClipboard } from '../state/globalActions';
import { AppDispatch } from '../state/store';

export default function inviteLink(appDispatch: AppDispatch) {
	appDispatch(copyUriToClipboard());
	appDispatch(userInfoChanged(localization.inviteLinkCopied));
}