/** Builds a Google search URL for the provided text, encoding any characters and spaces. */
export default function searchOnlineUri(text: string): string {
	return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}
