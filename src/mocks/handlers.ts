import { http, HttpResponse } from 'msw';
import HostInfo from '../client/contracts/HostInfo';
import StorageFilter from '../client/contracts/StorageFilter';
import GameInfo from '../client/contracts/GameInfo';
import Slice from '../client/contracts/Slice';

// Mock data for bot names
const mockBotNames = [
	'AI Player 1',
	'AI Player 2',
	'AI Player 3',
	'Smart Bot',
	'Quick Thinker',
];

// Mock data for host info
const mockHostInfo: HostInfo = {
	name: 'Mock SIGame Server',
	host: 'localhost',
	siHosts: {
		'default': 'http://localhost:8080'
	},
	port: 8080,
	contentPublicBaseUrls: ['http://localhost:8080/content'],
	license: 'This is a mock server for testing purposes. All rights reserved.',
	maxPackageSizeMb: 100,
	contentInfos: [
		{
			ServiceUri: 'http://localhost:8080/content',
			ServiceName: 'Mock Content Service',
			IconUri: null
		}
	],
	storageInfos: [
		{
			ServiceUri: 'http://localhost:8080/storage',
			ServiceName: 'Mock Storage Service',
			IconUri: null,
			PackageCount: 150
		}
	]
};

// Mock data for storage filter
const mockStorageFilter: StorageFilter = {
	packages: {
		1: 5,
		2: 10,
		3: 8,
		4: 12
	},
	tags: ['general', 'history', 'science', 'geography', 'entertainment']
};

// Mock game data
const mockGames: GameInfo[] = [
	{
		HostUri: 'http://localhost:8080',
		GameID: 1,
		GameName: 'Test Game 1',
		Language: 'en-US',
		Mode: 0, // Classic
		Owner: 'TestUser',
		PackageName: 'Test Package 1',
		PasswordRequired: false,
		Persons: [
			{ IsOnline: true, Name: 'TestUser', Role: 'Showman' as any },
			{ IsOnline: true, Name: 'AI Player 1', Role: 'Player' as any },
			{ IsOnline: true, Name: 'AI Player 2', Role: 'Player' as any }
		],
		ProgressCurrent: 0,
		ProgressTotal: 100,
		RealStartTime: new Date().toISOString(),
		Rules: 'Standard rules',
		Stage: 'Created' as any,
		StageName: 'Lobby',
		Started: false,
		StartTime: new Date().toISOString()
	},
	{
		HostUri: 'http://localhost:8080',
		GameID: 2,
		GameName: 'Test Game 2',
		Language: 'en-US',
		Mode: 1, // Simple
		Owner: 'Player2',
		PackageName: 'Test Package 2',
		PasswordRequired: true,
		Persons: [
			{ IsOnline: true, Name: 'Player2', Role: 'Showman' as any },
			{ IsOnline: true, Name: 'AI Player 3', Role: 'Player' as any }
		],
		ProgressCurrent: 25,
		ProgressTotal: 100,
		RealStartTime: new Date().toISOString(),
		Rules: 'Standard rules',
		Stage: 'Started' as any,
		StageName: 'Round 1',
		Started: true,
		StartTime: new Date().toISOString()
	}
];

export const handlers = [
	// GET /api/v1/info/bots - Returns mock bot names
	http.get('*/api/v1/info/bots', () => {
		return HttpResponse.json(mockBotNames);
	}),

	// GET /api/v1/info/host - Returns mock HostInfo
	http.get('*/api/v1/info/host', () => {
		return HttpResponse.json(mockHostInfo);
	}),

	// GET /api/v1/info/storage-filter/:storageId - Returns mock StorageFilter
	http.get('*/api/v1/info/storage-filter/:storageId', ({ params }) => {
		const { storageId } = params;
		console.log(`[MSW] Storage filter requested for storageId: ${storageId}`);
		return HttpResponse.json(mockStorageFilter);
	}),

	// POST /api/v1/games - Create a new game
	http.post('*/api/v1/games', async ({ request }) => {
		const body = await request.json();
		console.log('[MSW] Game creation requested:', body);
		
		return HttpResponse.json({
			Code: 0, // Success
			HostUri: 'http://localhost:8080',
			GameId: Math.floor(Math.random() * 10000)
		});
	}),

	// POST /api/v1/games/auto - Create a new auto game
	http.post('*/api/v1/games/auto', async ({ request }) => {
		const body = await request.json();
		console.log('[MSW] Auto game creation requested:', body);
		
		return HttpResponse.json({
			Code: 0, // Success
			HostUri: 'http://localhost:8080',
			GameId: Math.floor(Math.random() * 10000)
		});
	}),

	// GET /api/v1/games?pin=:pin - Get game by PIN
	http.get('*/api/v1/games', ({ request }) => {
		const url = new URL(request.url);
		const pin = url.searchParams.get('pin');
		
		if (!pin) {
			return new HttpResponse(null, { status: 400 });
		}

		console.log(`[MSW] Game lookup by PIN: ${pin}`);

		// Return first mock game for any valid PIN
		return HttpResponse.json({
			GameId: mockGames[0].GameID,
			HostUri: mockGames[0].HostUri
		});
	}),
];

// Note: SignalR mocking is complex and typically requires a separate approach
// For SignalR hubs (/sionline and /sihost), consider using signalr-no-jquery with mock transport
// or test without SignalR by focusing on the HTTP API endpoints.
// A full SignalR mock would need to handle the handshake, WebSocket connections, and hub methods.
