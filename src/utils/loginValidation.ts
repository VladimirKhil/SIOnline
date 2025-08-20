import localization from '../model/resources/localization';

/**
 * Validates a login name according to application rules
 * @param name The name to validate
 * @returns Error message if invalid, null if valid
 */
export const validateLoginName = (name: string): string | null => {
	const trimmedName = name.trim();

	// Check if name is empty or only spaces
	if (trimmedName.length === 0) {
		return localization.invalidNameEmpty;
	}

	// Check length (max 30 characters)
	if (trimmedName.length > 30) {
		return localization.invalidNameLength;
	}

	// Check for valid characters: Unicode letters, digits, spaces, dashes, underscores, dots, @ symbol
	const validNamePattern = /^[\p{L}\p{N}\s\-_.@]+$/u;

	if (!validNamePattern.test(trimmedName)) {
		return localization.invalidNameCharacters;
	}

	return null;
};
