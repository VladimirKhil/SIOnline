import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import JoinMode from '../src/client/game/JoinMode';
import Role from '../src/client/models/Role';
import PlayerStates from '../src/client/models/enums/PlayerStates';
import SeatButton from '../src/components/game/SeatButton/SeatButton';
import { PlayerView } from '../src/components/game/PlayerView/PlayerView';
import { ShowmanReplicView } from '../src/components/game/ShowmanReplicView/ShowmanReplicView';
import { PersonView } from '../src/components/game/PersonView/PersonView';
import { useAppDispatch, useAppSelector } from '../src/state/hooks';
import State, { initialState } from '../src/state/State';

jest.mock('../src/state/hooks', () => ({
	useAppDispatch: jest.fn(),
	useAppSelector: jest.fn(),
}));

describe('seat buttons', () => {
	let state: State;
	const dispatch = jest.fn();

	beforeEach(() => {
		state = {
			...initialState,
			common: { ...initialState.common, isSIHostConnected: true },
			room2: { ...initialState.room2, role: Role.Viewer, joinMode: JoinMode.AnyRole },
		};
		dispatch.mockReset();
		jest.mocked(useAppDispatch).mockReturnValue(dispatch);
		jest.mocked(useAppSelector).mockImplementation(selector => selector(state));
	});

	it('shows a button over each empty player and showman avatar', () => {
		const player = {
			...state.room2.persons.showman,
			sum: 0, stake: 0, state: PlayerStates.None, canBeSelected: false, isChooser: false,
			inGame: true, mediaLoaded: false, mediaPreloaded: false, mediaPreloadProgress: 0,
			answer: '', isAppellating: false,
		};
		const store = createStore(() => state);
		const markup = renderToStaticMarkup(
			<Provider store={store}>
				<PlayerView
					player={player} account={null} isMe={false} avatar={null} avatarKey={null} avatarClass={null}
					index={2} isSelectionEnabled={false} showVideoAvatars={false} windowWidth={1200} windowHeight={800}
					currentPrice={0} listRef={React.createRef()} onSumChanged={() => {}} onPlayerSelected={() => {}}
				/>
				<ShowmanReplicView
					all={{}} decisionTimer={state.room2.timers.decision} avatar={null} avatarKey={null} showVideoAvatars={false}
				/>
			</Provider>
		);

		expect(markup).toMatch(/class="playerAvatar[^"]*"[^>]*><button[^>]*class="seatButton"/);
		expect(markup).toMatch(/class="showmanAvatar[^"]*"[^>]*><button[^>]*class="seatButton"/);
	});

	it.each([
		['occupied seat', { personName: 'Player', role: Role.Viewer, joinMode: JoinMode.AnyRole, connected: true }],
		['player role', { personName: '', role: Role.Player, joinMode: JoinMode.AnyRole, connected: true }],
		['viewers-only mode', { personName: '', role: Role.Viewer, joinMode: JoinMode.OnlyViewer, connected: true }],
		['disconnected', { personName: '', role: Role.Viewer, joinMode: JoinMode.AnyRole, connected: false }],
	])('hides the button for %s', (_description, options) => {
		state = {
			...state,
			common: { ...state.common, isSIHostConnected: options.connected },
			room2: { ...state.room2, role: options.role, joinMode: options.joinMode },
		};
		expect(renderToStaticMarkup(<SeatButton isShowman={false} tableIndex={0} personName={options.personName} />)).toBe('');
	});

	it('keeps the empty showman avatar visible during a game on a narrow screen', () => {
		state = {
			...state,
			ui: { ...state.ui, windowWidth: 600 },
			room2: { ...state.room2, stage: { ...state.room2.stage, isGameStarted: true } },
		};
		const markup = renderToStaticMarkup(
			<Provider store={createStore(() => state)}>
				<ShowmanReplicView
					all={{}} decisionTimer={state.room2.timers.decision} avatar={null} avatarKey={null} showVideoAvatars={false}
				/>
			</Provider>
		);
		expect(markup).toContain('class="showmanInfo" style="display:flex"');
		expect(markup).toMatch(/class="showmanAvatar[^"]*"[^>]*><button[^>]*class="seatButton"/);
	});

	it('does not place a seating button in the side menu', () => {
		const markup = renderToStaticMarkup(
			<PersonView account={null} avatar={null} seat={{ isPlayerScope: false, tableIndex: 0 }} />
		);
		expect(markup).not.toContain('seatButton');
	});

	it.each([
		[true, 0],
		[false, 2],
	])('sends the selected table in the seating request (showman: %s)', async (isShowman, tableIndex) => {
		const button = SeatButton({ isShowman, tableIndex, personName: '' });
		const stopPropagation = jest.fn();
		button?.props.onClick({ stopPropagation });
		expect(stopPropagation).toHaveBeenCalled();

		const gameSeat = jest.fn().mockResolvedValue(true);
		await dispatch.mock.calls[0][0](jest.fn(), () => state, { game: { seat: gameSeat } });
		expect(gameSeat).toHaveBeenCalledWith(isShowman, tableIndex);
	});
});
