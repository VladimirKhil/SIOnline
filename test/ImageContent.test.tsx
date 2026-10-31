import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useSelector } from 'react-redux';
import ImageContent from '../src/components/gameTable/ImageContent/ImageContent';
import Role from '../src/model/Role';
import TimerStates from '../src/model/enums/TimeStates';
import { useAppDispatch } from '../src/state/hooks';

jest.mock('react-redux', () => ({
	useSelector: jest.fn(),
}));

jest.mock('../src/state/hooks', () => ({
	useAppDispatch: jest.fn(),
}));

function render(options: { hideImageOnAnswerAndPause: boolean, isMediaStopped: boolean, role: Role }): string {
	(useAppDispatch as unknown as jest.Mock).mockReturnValue(jest.fn());

	(useSelector as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) => selector({
		table: {
			loadTimer: {
				state: TimerStates.Stopped,
				value: 1,
				maximum: 1,
				isPausedBySystem: true,
				isPausedByUser: false,
			},
			isMediaStopped: options.isMediaStopped,
		},
		room2: {
			role: options.role,
			settings: {
				hideImageOnAnswerAndPause: options.hideImageOnAnswerAndPause,
				timeSettings: { partialImageTime: 3 },
			},
			stage: { isGamePaused: false },
		},
	}));

	return renderToStaticMarkup(<ImageContent uri="image.png" />);
}

describe('ImageContent', () => {
	// The image is not loaded during static rendering, so the loading spinner is shown unless the image is hidden

	it('keeps the image for the showman when the media is stopped', () => {
		const markup = render({ hideImageOnAnswerAndPause: true, isMediaStopped: true, role: Role.Showman });

		expect(markup).toContain('spinnerImg');
	});

	it('hides the image for a player when the media is stopped', () => {
		const markup = render({ hideImageOnAnswerAndPause: true, isMediaStopped: true, role: Role.Player });

		expect(markup).not.toContain('spinnerImg');
	});

	it('keeps the image for a player when the rule is disabled', () => {
		const markup = render({ hideImageOnAnswerAndPause: false, isMediaStopped: true, role: Role.Player });

		expect(markup).toContain('spinnerImg');
	});
});
