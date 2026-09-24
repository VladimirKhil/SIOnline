type PressedKey = Pick<KeyboardEvent, 'key' | 'code'>;

// US layout characters of layout-dependent keys (letter and digit keys are handled separately)
const layoutKeyNames: Record<string, string> = {
	Backquote: '`',
	Backslash: '\\',
	BracketLeft: '[',
	BracketRight: ']',
	Comma: ',',
	Equal: '=',
	IntlBackslash: '\\',
	Minus: '-',
	Period: '.',
	Quote: '\'',
	Semicolon: ';',
	Slash: '/',
};

/** Gets the US layout character of a physical key whose character depends on the keyboard layout. */
export function getLayoutKeyName(code: string): string | undefined {
	if (/^(Key[A-Z]|Digit[0-9])$/.test(code)) {
		return code.charAt(code.length - 1);
	}

	return layoutKeyNames[code];
}

/** Layout-dependent keys are stored as physical key codes to work in any layout and regardless of Shift or Caps Lock. */
export function getPressedKey(e: PressedKey): string {
	return getLayoutKeyName(e.code) !== undefined ? e.code : e.key;
}

/** Matches both physical key codes and key values (stored for other keys and by previous versions). */
export function matchesKey(e: PressedKey, key: string | null): boolean {
	return !!key && (e.code === key || e.key === key);
}
