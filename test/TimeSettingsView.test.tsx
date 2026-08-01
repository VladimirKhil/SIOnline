import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TimeSettingsView from '../src/components/settings/TimeSettingsView/TimeSettingsView';
import localization from '../src/model/resources/localization';
import { useAppDispatch, useAppSelector } from '../src/state/hooks';

jest.mock('../src/state/hooks', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

describe('TimeSettingsView', () => {
	beforeEach(() => {
		(useAppDispatch as unknown as jest.Mock).mockReturnValue(jest.fn());
		(useAppSelector as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) => selector({
			settings: {
				appSettings: {
					timeSettings: {
						timeForChoosingQuestion: 30,
						timeForThinkingOnQuestion: 5,
						timeForPrintingAnswer: 25,
						timeForGivingACat: 30,
						timeForMakingStake: 30,
						timeForThinkingOnSpecial: 25,
						timeOfRound: 3600,
						timeForChoosingFinalTheme: 30,
						timeForFinalThinking: 45,
						timeForShowmanDecisions: 30,
						timeForRightAnswer: 2,
						timeForBlockingButton: 3,
						partialImageTime: 3,
						imageTime: 5,
						buttonsAccepting: 300,
					},
				},
			},
		}));
	});

	it('renders the buttons accepting setting after the thinking on question setting', () => {
		const markup = renderToStaticMarkup(<TimeSettingsView />);

		expect(markup).toContain(localization.buttonsAccepting);
		expect(markup).toContain('ms');
		expect(markup.indexOf(localization.timeForThinkingOnQuestion)).toBeLessThan(markup.indexOf(localization.buttonsAccepting));
	});
});
