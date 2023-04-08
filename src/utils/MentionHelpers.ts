export default function hasUserMentioned(message: string, user: string): boolean {
	const regex = new RegExp(`@${user}\\W`);
	return regex.test(message);
}
