import AccountType from './enums/AccountType';
import Gender from './enums/Gender';

/** Defines a person account in game server models. */
export default interface GameAccount {
	name: string;
	type: AccountType;
	gender: Gender;
	avatarUri: string;
}
