import { Store } from 'redux';
import IHost from '../src/host/IHost';
import Constants from '../src/model/enums/Constants';
import GameStage from '../src/model/enums/GameStage';
import Path from '../src/model/enums/Path';
import PlayerStates from '../src/model/enums/PlayerStates';
import PlayerInfo from '../src/model/PlayerInfo';
import localization from '../src/model/resources/localization';
import State, { initialState } from '../src/state/State';
import { buildRichPresence, subscribeToRichPresence } from '../src/utils/RichPresenceHelpers';

interface StateOptions {
	path?: Path;
	packageName?: string | null;
	stage?: string;
	isGameStarted?: boolean;
	roundIndex?: number;
	roundsNames?: string[];
	players?: string[];
	showman?: string;
	/** Names of computer persons. */
	computers?: string[];
	userName?: string;
	gameId?: number;
	hostUri?: string;
}

function createPlayer(name: string, isHuman: boolean): PlayerInfo {
	return {
		name,
		isReady: false,
		sum: 0,
		stake: 0,
		state: PlayerStates.None,
		canBeSelected: false,
		replic: null,
		isDeciding: false,
		isHuman,
		isChooser: false,
		inGame: true,
		mediaLoaded: false,
		mediaPreloaded: false,
		mediaPreloadProgress: 0,
		answer: '',
		isAppellating: false,
	};
}

function createState({
	path = Path.Menu,
	packageName = null,
	stage = '',
	isGameStarted = stage !== '' && stage !== GameStage.Before,
	roundIndex = -1,
	roundsNames = [],
	players = [],
	showman = initialState.room2.persons.showman.name,
	computers = [],
	userName = '',
	gameId,
	hostUri,
}: StateOptions = {}): State {
	const isHuman = (name: string) => !computers.includes(name);

	return {
		...initialState,
		ui: { ...initialState.ui, navigation: { path, gameId, hostUri } },
		common: { ...initialState.common, siHosts: { a: 'https://host/' } },
		room: {
			...initialState.room,
			stage: { ...initialState.room.stage, name: stage, roundIndex },
			metadata: { ...initialState.room.metadata, packageName },
		},
		room2: {
			...initialState.room2,
			name: userName,
			roundsNames,
			persons: {
				...initialState.room2.persons,
				showman: { ...initialState.room2.persons.showman, name: showman, isHuman: isHuman(showman) },
				players: players.map(name => createPlayer(name, isHuman(name))),
			},
			stage: { ...initialState.room2.stage, isGameStarted },
		},
	};
}

function createStore(state: State) {
	let currentState = state;
	const listeners: (() => void)[] = [];

	return {
		getState: () => currentState,
		subscribe: jest.fn((listener: () => void) => {
			listeners.push(listener);
			return () => {};
		}),
		setState: (newState: State) => {
			currentState = newState;
			listeners.forEach(listener => listener());
		},
	};
}

describe('buildRichPresence', () => {
	beforeAll(() => {
		localization.setLanguage('en');
	});

	it.each([
		[Path.Loading, 'In main menu'],
		[Path.Menu, 'In main menu'],
		[Path.Lobby, 'Choosing a game'],
		[Path.NewRoom, 'Creating a game'],
		[Path.JoinRoom, 'Joining game…'],
		[Path.JoinByPin, 'Joining game…'],
		[Path.SIQuester, 'Editing a package'],
		[Path.SIQuesterPackage, 'Editing a package'],
	])('describes %s view without room details', (path, details) => {
		// Package of the previous room is kept in the state
		const state = createState({ path, packageName: 'Package', players: ['Alice'] });

		expect(buildRichPresence(state, 1000)).toEqual({ details, startTimestamp: 1000 });
	});

	it('describes a room with package name, game stage and occupied places', () => {
		const state = createState({
			path: Path.Room,
			packageName: 'Package',
			stage: GameStage.Before,
			players: ['Alice', Constants.ANY_NAME, 'Bob'],
		});

		expect(buildRichPresence(state, 1000)).toEqual({
			details: 'Package',
			state: 'Waiting for the game to start',
			startTimestamp: 1000,
			partySize: 2,
			partyMax: 3,
		});
	});

	it.each([
		[Constants.RANDOM_PACKAGE, 'Random themes'],
		['', undefined],
		[null, undefined],
	])('shows package %p as %p', (packageName, details) => {
		expect(buildRichPresence(createState({ path: Path.Room, packageName }), 1000).details).toBe(details);
	});

	it.each([
		['current round number', { stage: GameStage.Round, roundIndex: 1, roundsNames: ['First round', 'Music', 'Final'] }, 'Round 2/3'],
		['last round number', { stage: GameStage.Round, roundIndex: 2, roundsNames: ['1', '2', '3'] }, 'Round 3/3'],
		['unknown round', { stage: GameStage.Round, roundIndex: 2, roundsNames: ['First round'] }, 'Round'],
		['round before rounds are known', { stage: GameStage.Round, roundIndex: 0 }, 'Round'],
		['game start', { stage: GameStage.Begin }, 'Game started'],
		['demo game start', { stage: 'Started' }, 'Game started'],
		['game end', { stage: GameStage.After }, 'Game finished'],
		['previous game stage', { stage: GameStage.After, isGameStarted: false }, 'Waiting for the game to start'],
	])('describes %s', (_, options: StateOptions, stageName) => {
		expect(buildRichPresence(createState({ path: Path.Room, ...options }), 1000).state).toBe(stageName);
	});

	it('omits party when all player places are free', () => {
		const presence = buildRichPresence(createState({ path: Path.Room, players: [Constants.ANY_NAME, ''] }), 1000);

		expect(presence.partySize).toBeUndefined();
		expect(presence.partyMax).toBeUndefined();
	});

	it('treats demo game as a room', () => {
		const presence = buildRichPresence(createState({ path: Path.Demo, stage: GameStage.Before }), 1000);

		expect(presence).toEqual({ state: 'Waiting for the game to start', startTimestamp: 1000 });
	});

	describe('join button', () => {
		const room: StateOptions = { path: Path.Room, gameId: 12, hostUri: 'https://host/', userName: 'Alice' };

		it('links to the room join screen', () => {
			const presence = buildRichPresence(createState({ ...room, players: ['Alice', Constants.ANY_NAME] }), 1000);

			expect(presence.joinUrl).toBe('https://sigame.vladimirkhil.com/?_a12');
			expect(presence.joinLabel).toBe('Join');
		});

		it('uses full room link for an unknown host', () => {
			const presence = buildRichPresence(createState({ ...room, hostUri: 'https://other/', players: ['Alice', Constants.ANY_NAME] }), 1000);

			expect(presence.joinUrl).toBe('https://sigame.vladimirkhil.com/?gameId=12&host=https%3A%2F%2Fother%2F');
		});

		it.each([
			['all player places are occupied', { showman: 'Computer', players: ['Alice', 'Bob'], computers: ['Computer'] }],
			['a person has left the room', { showman: 'Computer', players: ['Alice', Constants.ANY_NAME], computers: ['Computer', Constants.ANY_NAME] }],
			['only the showman place is for people', { players: ['Alice', 'Bot'], computers: ['Bot'] }],
		])('is shown when %s', (_, options: StateOptions) => {
			expect(buildRichPresence(createState({ ...room, ...options }), 1000).joinUrl).toBeDefined();
		});

		it.each([
			['single game', { showman: 'Computer', players: ['Alice', 'Bot'], computers: ['Computer', 'Bot'] }],
			['single game with the user as showman', { showman: 'Alice', players: ['Bot 1', 'Bot 2'], computers: ['Bot 1', 'Bot 2'] }],
			['demo game', { path: Path.Demo, players: ['Alice', Constants.ANY_NAME] }],
			['room with unknown host', { hostUri: undefined, players: ['Alice', Constants.ANY_NAME] }],
			['lobby', { path: Path.Lobby }],
		])('is hidden in %s', (_, options: StateOptions) => {
			const presence = buildRichPresence(createState({ ...room, ...options }), 1000);

			expect(presence.joinUrl).toBeUndefined();
			expect(presence.joinLabel).toBeUndefined();
		});
	});

	it('uses current interface language', () => {
		localization.setLanguage('ru');

		try {
			expect(buildRichPresence(createState({ path: Path.Lobby }), 1000).details).toBe('Выбирает игру');
		} finally {
			localization.setLanguage('en');
		}
	});
});

describe('subscribeToRichPresence', () => {
	let now: jest.SpyInstance<number, []>;

	beforeAll(() => {
		localization.setLanguage('en');
	});

	beforeEach(() => {
		now = jest.spyOn(Date, 'now').mockReturnValue(1000);
	});

	afterEach(() => {
		now.mockRestore();
	});

	it('does not subscribe when host does not support presence', () => {
		const store = createStore(createState());

		subscribeToRichPresence(store as unknown as Store<State>, {} as IHost);

		expect(store.subscribe).not.toHaveBeenCalled();
	});

	it('publishes presence only when it changes', () => {
		const setRichPresence = jest.fn();
		const store = createStore(createState());

		subscribeToRichPresence(store as unknown as Store<State>, { setRichPresence } as unknown as IHost);

		expect(setRichPresence).toHaveBeenCalledTimes(1);
		expect(setRichPresence).toHaveBeenLastCalledWith({ details: 'In main menu', startTimestamp: 1000 });

		store.setState({ ...store.getState(), common: { ...store.getState().common, error: 'Unrelated change' } });
		expect(setRichPresence).toHaveBeenCalledTimes(1);

		store.setState(createState({ path: Path.Lobby }));
		expect(setRichPresence).toHaveBeenCalledTimes(2);
		expect(setRichPresence).toHaveBeenLastCalledWith({ details: 'Choosing a game', startTimestamp: 1000 });
	});

	it('restarts elapsed time when the user enters and leaves a room', () => {
		const setRichPresence = jest.fn();
		const store = createStore(createState({ path: Path.Lobby }));

		subscribeToRichPresence(store as unknown as Store<State>, { setRichPresence } as unknown as IHost);

		now.mockReturnValue(5000);
		store.setState(createState({ path: Path.Room, stage: GameStage.Before }));
		expect(setRichPresence).toHaveBeenLastCalledWith(expect.objectContaining({ startTimestamp: 5000 }));

		now.mockReturnValue(9000);
		store.setState(createState({ path: Path.Room, packageName: 'Package', stage: GameStage.Begin }));
		expect(setRichPresence).toHaveBeenLastCalledWith({ details: 'Package', state: 'Game started', startTimestamp: 5000 });

		store.setState(createState({ path: Path.Lobby }));
		expect(setRichPresence).toHaveBeenLastCalledWith({ details: 'Choosing a game', startTimestamp: 9000 });
	});
});
