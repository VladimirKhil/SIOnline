import Account from '../client/models/Account';
import Sex from '../client/models/enums/Sex';

export default function getAvatarClass(account: Account | null): string | null {
	if (!account) {
		return null;
	}

	return account.sex === Sex.Male ? 'avatarMale' : 'avatarFemale';
}
