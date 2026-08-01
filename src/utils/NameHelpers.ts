export function simplifyPersonName(name: string): string {
	return name.startsWith('Ⓢ') ? name.substring(1) : name;
}