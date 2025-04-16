export default function hasUserMentioned(message: string, user: string): boolean {
	const escapedUser = user.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	try {
		const regex = new RegExp(`@${escapedUser}\\W`);
		return regex.test(message);
	} catch (error) {
		console.error(`Error creating regex from user ${user}:`, error);
		return false;
	}
}
