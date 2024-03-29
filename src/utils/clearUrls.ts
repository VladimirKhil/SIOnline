// Regular expression to match URLs
const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;

/** Replaces URLs with an empty string. */
export default function clearUrls(text: string): string {
    return text.replace(urlRegex, '');
}