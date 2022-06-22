import Account from '../model/Account';
import Sex from '../model/enums/Sex';

export default function getAvatarClass(account: Account | null): string | null {
	if (!account) {
		return null;
	}

	return account.sex === Sex.Male ? 'avatarMale' : 'avatarFemale';
}
