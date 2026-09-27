import Role from '../src/model/Role';
import { buildHelloMessage, getHtmlContentRole } from '../src/components/gameTable/HtmlContent/HtmlContent';

describe('HTML content greeting', () => {
	it('should describe the local player together with their score', () => {
		expect(buildHelloMessage('Alice', Role.Player, 400)).toEqual({
			type: 'si:media-control',
			action: 'hello',
			name: 'Alice',
			role: 'player',
			sum: 400,
		});
	});

	it('should not provide score for a person who is not a player', () => {
		expect(buildHelloMessage('Bob', Role.Showman)).toEqual({
			type: 'si:media-control',
			action: 'hello',
			name: 'Bob',
			role: 'showman',
			sum: undefined,
		});
	});

	it('should convert every role to its content representation', () => {
		expect(getHtmlContentRole(Role.Viewer)).toBe('viewer');
		expect(getHtmlContentRole(Role.Player)).toBe('player');
		expect(getHtmlContentRole(Role.Showman)).toBe('showman');
	});
});
