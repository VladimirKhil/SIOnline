import Sex from './enums/Sex';

export default interface Account {
	name: string;
	sex: Sex;
	isHuman: boolean;
	avatar: string | null;
	avatarVideo?: string;
	authProvider?: string;
	userId?: string;
	badges?: string[];
}
