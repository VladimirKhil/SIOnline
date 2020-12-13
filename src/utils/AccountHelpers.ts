import Account from '../model/Account';
import Sex from '../model/enums/Sex';

import avatarMPng from '../../assets/images/avatar-m.png';
import avatarFPng from '../../assets/images/avatar-f.png';

export default function getAvatar(account: Account | null): string | null {
	if (!account) {
		return null;
	}

	return account.avatar || (account.sex === Sex.Male ? avatarMPng : avatarFPng);
}
