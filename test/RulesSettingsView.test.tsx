import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RulesSettingsView from '../src/components/settings/RulesSettingsView/RulesSettingsView';
import localization from '../src/model/resources/localization';
import { initialState as initialAppSettings } from '../src/model/AppSettings';
import GameType from '../src/model/GameType';
import { useAppDispatch, useAppSelector } from '../src/state/hooks';

jest.mock('../src/state/hooks', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

function render(hideImageOnAnswerAndPause: boolean): string {
	(useAppDispatch as unknown as jest.Mock).mockReturnValue(jest.fn());

	(useAppSelector as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) => selector({
		settings: {
			appSettings: {
				...initialAppSettings,
				hideImageOnAnswerAndPause,
			},
		},
		game: {
			type: GameType.Classic,
		},
	}));

	return renderToStaticMarkup(<RulesSettingsView />);
}

describe('RulesSettingsView', () => {
	it('renders the image hiding rule', () => {
		const markup = render(false);

		expect(markup).toContain(localization.hideImageOnAnswerAndPause);
		expect(markup).toContain(localization.hideImageOnAnswerAndPauseHint);
		expect(markup).toContain('<input type="checkbox" id="hideImageOnAnswerAndPause"/>');
	});

	it('checks the image hiding rule when it is enabled', () => {
		const markup = render(true);

		expect(markup).toContain('<input type="checkbox" id="hideImageOnAnswerAndPause" checked=""/>');
	});
});
