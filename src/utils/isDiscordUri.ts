export default function isDiscordUri(uri: string): boolean {
	return uri.startsWith('https://discord.gg/') || uri.startsWith('https://discord.com/');
}
