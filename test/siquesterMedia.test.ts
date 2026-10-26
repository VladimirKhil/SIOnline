/**
 * @jest-environment jsdom
 */

import { configureStore } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import reducer, {
	openFile,
	savePackage,
	setContentItemMedia,
	removeQuestion,
	SIQuesterState,
} from '../src/state/siquesterSlice';
import commonReducer from '../src/state/commonSlice';
import { createDefaultPackage } from '../src/model/siquester/packageGenerator';
import { downloadPackageAsSIQ } from '../src/model/siquester/packageExporter';

jest.mock('../src/model/siquester/packageExporter', () => ({
	downloadPackageAsSIQ: jest.fn(),
}));

jest.mock('../src/utils/Navigator', () => ({
	navigate: jest.fn(() => ({ type: 'NAVIGATE_MOCK' })),
}));

function createStoreWithExtra(preloadedState?: any) {
	return configureStore({
		reducer: {
			siquester: reducer as any,
			common: commonReducer as any,
		} as any,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				// Disable immutability and serializability checks for mutable JSZip instances in state
				immutableCheck: false,
				serializableCheck: false,
				thunk: {
					extraArgument: {
						file: null,
						config: { siStatisticsServiceUri: '' },
					},
				},
			}),
	});
}

/**
 * Creates a Node Buffer-backed File-compatible object for JSZip.loadAsync in Jest
 */
async function createTestPackageFile(zip: JSZip): Promise<File> {
	const buffer = await zip.generateAsync({ type: 'nodebuffer' });
	const file = buffer as any;
	file.name = 'test.siq';
	return file;
}

function createPackageXml(options: {
	logo?: string;
	questions: { isRef: boolean; type: string; value: string }[];
}): string {
	const logoAttr = options.logo ? `logo="${options.logo}"` : '';
	const questionsXml = options.questions
		.map(
			(q, i) => `
			<question price="${(i + 1) * 100}">
				<params>
					<param name="question" type="content">
						<item type="${q.type}" isRef="${q.isRef}">${q.value}</item>
					</param>
				</params>
				<right><answer>answer</answer></right>
			</question>
		`,
		)
		.join('');

	return `<?xml version="1.0" encoding="utf-8"?>
<package name="Test" version="5" ${logoAttr}>
	<rounds>
		<round name="Round 1">
			<themes>
				<theme name="Theme 1">
					<questions>${questionsXml}</questions>
				</theme>
			</themes>
		</round>
	</rounds>
</package>`;
}

describe('SIQuester Media Normalization and Cleanup', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('openFile media normalization', () => {
		test('decodes URL-encoded filenames and sanitizes invalid characters', async () => {
			const zip = new JSZip();
			const xml = createPackageXml({
				questions: [
					{ isRef: true, type: 'image', value: 'my image.png' },
					{ isRef: true, type: 'audio', value: 'track_1.mp3' },
				],
			});

			zip.file('content.xml', xml);
			zip.file('Images/my%20image.png', 'image-content');
			zip.file('Audio/track:1.mp3', 'audio-content');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;

			// Check files in archive are decoded and sanitized
			expect(state.zip?.file('Images/my image.png')).not.toBeNull();
			expect(state.zip?.file('Images/my%20image.png')).toBeNull();
			expect(state.zip?.file('Audio/track_1.mp3')).not.toBeNull();
			expect(state.zip?.file('Audio/track:1.mp3')).toBeNull();

			// Check references in question items are updated
			const q1 = state.pack?.rounds[0].themes[0].questions[0];
			const q2 = state.pack?.rounds[0].themes[0].questions[1];
			expect(q1?.params.question?.items[0].value).toBe('my image.png');
			expect(q2?.params.question?.items[0].value).toBe('track_1.mp3');
		});

		test('resolves URL-encoded references from content.xml to decoded zip files', async () => {
			const zip = new JSZip();
			// content.xml contains percent-encoded reference
			const xml = createPackageXml({
				questions: [{ isRef: true, type: 'image', value: 'my%20photo.png' }],
			});

			zip.file('content.xml', xml);
			// Zip file is stored percent-encoded
			zip.file('Images/my%20photo.png', 'photo-bytes');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;

			// The reference in pack must be normalized to unencoded form
			const q = state.pack?.rounds[0].themes[0].questions[0];
			expect(q?.params.question?.items[0].value).toBe('my photo.png');
			expect(state.zip?.file('Images/my photo.png')).not.toBeNull();
		});

        test('preserves clean filename and gives collision suffix to dirty filename', async () => {
			const zip = new JSZip();
			const xml = createPackageXml({
				questions: [
					{ isRef: true, type: 'image', value: 'cat_image.png' },
					{ isRef: true, type: 'image', value: 'cat?image.png' },
				],
			});

			zip.file('content.xml', xml);
			// Simulate order where dirty file comes first in zip
			zip.file('Images/cat?image.png', 'dirty-cat');
			zip.file('Images/cat_image.png', 'clean-cat');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;

			// Clean file must retain 'cat_image.png', dirty must become 'cat_image (1).png'
			expect(state.zip?.file('Images/cat_image.png')).not.toBeNull();
			expect(state.zip?.file('Images/cat_image (1).png')).not.toBeNull();

			const contentClean = await state.zip?.file('Images/cat_image.png')?.async('text');
			const contentDirty = await state.zip?.file('Images/cat_image (1).png')?.async('text');
			expect(contentClean).toBe('clean-cat');
			expect(contentDirty).toBe('dirty-cat');
		});

		test('does not overwrite clean rename mapping with collision alias', async () => {
			const zip = new JSZip();
			const xml = createPackageXml({
				questions: [
					{ isRef: true, type: 'image', value: 'cat_image.png' },
					{ isRef: true, type: 'image', value: 'cat?image.png' },
				],
			});

			zip.file('content.xml', xml);
			zip.file('Images/cat_image.png', 'clean-cat');
			zip.file('Images/cat?image.png', 'dirty-cat');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;
			const q1 = state.pack?.rounds[0].themes[0].questions[0];
			const q2 = state.pack?.rounds[0].themes[0].questions[1];

			// Question 1 must point to cat_image.png, Question 2 must point to cat_image (1).png
			expect(q1?.params.question?.items[0].value).toBe('cat_image.png');
			expect(q2?.params.question?.items[0].value).toBe('cat_image (1).png');
		});

		test('normalizes package logo with @ prefix properly', async () => {
			const zip = new JSZip();
			const xml = createPackageXml({
				logo: '@my:logo%20file.png',
				questions: [],
			});

			zip.file('content.xml', xml);
			zip.file('Images/my:logo%20file.png', 'logo-data');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;

			expect(state.pack?.logo).toBe('@my_logo file.png');
			expect(state.zip?.file('Images/my_logo file.png')).not.toBeNull();
		});
	});

	describe('cleanOrphanedMediaFiles on savePackage', () => {
		test('removes unreferenced media files and keeps active ones including logo', async () => {
			const mockZip = new JSZip();
			mockZip.file('Images/used_image.png', 'image');
			mockZip.file('Images/orphan_image.png', 'orphan');
			mockZip.file('Audio/used_audio.mp3', 'audio');
			mockZip.file('Audio/orphan_audio.mp3', 'orphan');
			mockZip.file('Images/logo.png', 'logo');
			mockZip.file('content.xml', 'content');

			const pack = createDefaultPackage({
				packageName: 'Test',
				authorName: 'Author',
				roundCount: 1,
				themeCount: 1,
				questionCount: 1,
				includeFinalRound: false,
				finalThemeCount: 0,
			});

			pack.logo = '@logo.png';
			pack.rounds[0].themes[0].questions[0].params.question = {
				items: [
					{ type: 'image', value: 'used_image.png', isRef: true, placement: 'screen' },
				],
			};
			pack.rounds[0].themes[0].questions[0].params.answerOptions = {
				A: {
					items: [{ type: 'audio', value: 'used_audio.mp3', isRef: true, placement: 'screen' }],
				},
			};

			const store = createStoreWithExtra({
				siquester: { pack, zip: mockZip },
				common: commonReducer(undefined, { type: '@@INIT' }),
			});

			await store.dispatch(savePackage() as any);

			// Used files and logo must remain
			expect(mockZip.file('Images/used_image.png')).not.toBeNull();
			expect(mockZip.file('Audio/used_audio.mp3')).not.toBeNull();
			expect(mockZip.file('Images/logo.png')).not.toBeNull();
			expect(mockZip.file('content.xml')).not.toBeNull();

			// Orphaned files must be removed
			expect(mockZip.file('Images/orphan_image.png')).toBeNull();
			expect(mockZip.file('Audio/orphan_audio.mp3')).toBeNull();
		});
	});

	describe('removeOrphanedMediaFile during editing actions', () => {
		test('does not delete file if it is shared with another question', () => {
			const mockZip = new JSZip();
			mockZip.file('Images/shared.png', 'shared content');

			const pack = createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 2,
				includeFinalRound: false,
				finalThemeCount: 0,
			});

			// Both Question 0 and Question 1 use 'shared.png'
			pack.rounds[0].themes[0].questions[0].params.question = {
				items: [{ type: 'image', value: 'shared.png', isRef: true, placement: 'screen' }],
			};
			pack.rounds[0].themes[0].questions[1].params.question = {
				items: [{ type: 'image', value: 'shared.png', isRef: true, placement: 'screen' }],
			};

			const state: SIQuesterState = { zip: mockZip, pack };

			// Question 0 replaces 'shared.png' with 'new.png'
			const nextState = reducer(
				state,
				setContentItemMedia({
					roundIndex: 0,
					themeIndex: 0,
					questionIndex: 0,
					paramName: 'question',
					itemIndex: 0,
					type: 'image',
					fileName: 'new.png',
					fileData: 'bmV3',
				}),
			);

			// 'shared.png' must still exist in zip because Question 1 uses it
			expect(nextState.zip?.file('Images/shared.png')).not.toBeNull();
			expect(nextState.zip?.file('Images/new.png')).not.toBeNull();
		});
	});
	
	describe('setContentItemMedia collision handling and sanitization', () => {
		test('resolves filename collision by adding suffix when file exists in archive', async () => {
			const mockZip = new JSZip();
			mockZip.file('Images/photo.png', 'existing-photo');

			const pack = createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 2,
				includeFinalRound: false,
				finalThemeCount: 0,
			});

			// Question 1 already references photo.png
			pack.rounds[0].themes[0].questions[1].params.question = {
				items: [{ type: 'image', value: 'photo.png', isRef: true, placement: 'screen' }],
			};

			const state: SIQuesterState = { zip: mockZip, pack };

			// Question 0 uploads a new file with the same name 'photo.png'
			const nextState = reducer(
				state,
				setContentItemMedia({
					roundIndex: 0,
					themeIndex: 0,
					questionIndex: 0,
					paramName: 'question',
					itemIndex: 0,
					type: 'image',
					fileName: 'photo.png',
					fileData: 'bmV3LXBob3Rv',
				}),
			);

			// New file must receive collision suffix
			expect(nextState.zip?.file('Images/photo (1).png')).not.toBeNull();
			const q0Item = nextState.pack?.rounds[0].themes[0].questions[0].params.question?.items[0];
			expect(q0Item?.value).toBe('photo (1).png');

			// Existing photo must remain intact and unchanged
			const existingContent = await nextState.zip?.file('Images/photo.png')?.async('text');
			expect(existingContent).toBe('existing-photo');
		});

		test('overwrites file with same name in same question without creating collision duplicate', async () => {
			const mockZip = new JSZip();
			mockZip.file('Images/photo.png', 'old-version');

			const pack = createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 1,
				includeFinalRound: false,
				finalThemeCount: 0,
			});

			// Question 0 already has photo.png
			pack.rounds[0].themes[0].questions[0].params.question = {
				items: [{ type: 'image', value: 'photo.png', isRef: true, placement: 'screen' }],
			};

			const state: SIQuesterState = { zip: mockZip, pack };

			// Question 0 uploads an updated file with the same name 'photo.png'
			const nextState = reducer(
				state,
				setContentItemMedia({
					roundIndex: 0,
					themeIndex: 0,
					questionIndex: 0,
					paramName: 'question',
					itemIndex: 0,
					type: 'image',
					fileName: 'photo.png',
					fileData: 'bmV3LXZlcnNpb24=',
				}),
			);

			// Must NOT create photo (1).png
			expect(nextState.zip?.file('Images/photo (1).png')).toBeNull();

			// Question item must still reference photo.png
			const q0Item = nextState.pack?.rounds[0].themes[0].questions[0].params.question?.items[0];
			expect(q0Item?.value).toBe('photo.png');

			// Content in ZIP must be updated
			expect(nextState.zip?.file('Images/photo.png')).not.toBeNull();
		});

		test('resolves collision with package logo', () => {
			const mockZip = new JSZip();
			mockZip.file('Images/logo.png', 'logo-data');

			const pack = createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 1,
				includeFinalRound: false,
				finalThemeCount: 0,
			});

			pack.logo = '@logo.png';

			const state: SIQuesterState = { zip: mockZip, pack };

			// Question 0 uploads a file named 'logo.png'
			const nextState = reducer(
				state,
				setContentItemMedia({
					roundIndex: 0,
					themeIndex: 0,
					questionIndex: 0,
					paramName: 'question',
					itemIndex: 0,
					type: 'image',
					fileName: 'logo.png',
					fileData: 'bmV3LWltYWdl',
				}),
			);

			// Question image must get collision suffix to protect the logo
			expect(nextState.zip?.file('Images/logo (1).png')).not.toBeNull();
			const q0Item = nextState.pack?.rounds[0].themes[0].questions[0].params.question?.items[0];
			expect(q0Item?.value).toBe('logo (1).png');

			// Package logo must remain untouched
			expect(nextState.pack?.logo).toBe('@logo.png');
			expect(nextState.zip?.file('Images/logo.png')).not.toBeNull();
		});

		test('sanitizes invalid characters in uploaded filename', () => {
			const mockZip = new JSZip();
			const pack = createDefaultPackage({
				packageName: '',
				authorName: '',
				roundCount: 1,
				themeCount: 1,
				questionCount: 1,
				includeFinalRound: false,
				finalThemeCount: 0,
			});

			const state: SIQuesterState = { zip: mockZip, pack };

			const nextState = reducer(
				state,
				setContentItemMedia({
					roundIndex: 0,
					themeIndex: 0,
					questionIndex: 0,
					paramName: 'question',
					itemIndex: 0,
					type: 'image',
					fileName: 'my:invalid?image*.png',
					fileData: 'ZGF0YQ==',
				}),
			);

			// Invalid characters must be replaced with underscores
			expect(nextState.zip?.file('Images/my_invalid_image_.png')).not.toBeNull();
			const q0Item = nextState.pack?.rounds[0].themes[0].questions[0].params.question?.items[0];
			expect(q0Item?.value).toBe('my_invalid_image_.png');
		});
	});
	
	describe('Cyrillic percent-encoded media handling and end-to-end lifecycle', () => {
		test('decodes multi-byte UTF-8 Cyrillic filenames and links them to question references', async () => {
			const zip = new JSZip();
			// %D0%BA%D0%BE%D1%82%D0%B8%D0%BA.png = "котик.png"
			// %D0%BF%D0%B5%D1%81%D0%BD%D1%8F.mp3 = "песня.mp3"
			const xml = createPackageXml({
				questions: [
					{ isRef: true, type: 'image', value: 'котик.png' },
					{ isRef: true, type: 'audio', value: 'песня.mp3' },
				],
			});

			zip.file('content.xml', xml);
			zip.file('Images/%D0%BA%D0%BE%D1%82%D0%B8%D0%BA.png', 'cat-image-data');
			zip.file('Audio/%D0%BF%D0%B5%D1%81%D0%BD%D1%8F.mp3', 'song-audio-data');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;

			// Zip files must be decoded to readable Cyrillic
			expect(state.zip?.file('Images/котик.png')).not.toBeNull();
			expect(state.zip?.file('Images/%D0%BA%D0%BE%D1%82%D0%B8%D0%BA.png')).toBeNull();
			expect(state.zip?.file('Audio/песня.mp3')).not.toBeNull();
			expect(state.zip?.file('Audio/%D0%BF%D0%B5%D1%81%D0%BD%D1%8F.mp3')).toBeNull();

			// Verify binary content is preserved intact
			const catContent = await state.zip?.file('Images/котик.png')?.async('text');
			expect(catContent).toBe('cat-image-data');

			// Question items must reference clean Cyrillic names
			const q1 = state.pack?.rounds[0].themes[0].questions[0];
			const q2 = state.pack?.rounds[0].themes[0].questions[1];
			expect(q1?.params.question?.items[0].value).toBe('котик.png');
			expect(q2?.params.question?.items[0].value).toBe('песня.mp3');
		});

		test('resolves collisions for Cyrillic filenames with invalid characters', async () => {
			const zip = new JSZip();
			// %D0%BA%D0%BE%D1%82%3F.png = "кот?.png"
			// %D0%BA%D0%BE%D1%82%2A.png = "кот*.png"
			// Both sanitize to "кот_.png"
			const xml = createPackageXml({
				questions: [
					{ isRef: true, type: 'image', value: 'кот?.png' },
					{ isRef: true, type: 'image', value: 'кот*.png' },
				],
			});

			zip.file('content.xml', xml);
			zip.file('Images/%D0%BA%D0%BE%D1%82%3F.png', 'cat-question-mark');
			zip.file('Images/%D0%BA%D0%BE%D1%82%2A.png', 'cat-asterisk');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			const state = store.getState().siquester;

			// Files in zip must become "кот_.png" and "кот_ (1).png"
			expect(state.zip?.file('Images/кот_.png')).not.toBeNull();
			expect(state.zip?.file('Images/кот_ (1).png')).not.toBeNull();

			// Question references must point to the respective resolved filenames
			const q1 = state.pack?.rounds[0].themes[0].questions[0];
			const q2 = state.pack?.rounds[0].themes[0].questions[1];
			expect(q1?.params.question?.items[0].value).toBe('кот_.png');
			expect(q2?.params.question?.items[0].value).toBe('кот_ (1).png');

			// Verify content matches expected mapping
			const content1 = await state.zip?.file('Images/кот_.png')?.async('text');
			const content2 = await state.zip?.file('Images/кот_ (1).png')?.async('text');
			expect(content1).toBe('cat-question-mark');
			expect(content2).toBe('cat-asterisk');
		});

		test('end-to-end: loads encoded Cyrillic package, deletes question, saves with clean filenames and purged orphans', async () => {
			const zip = new JSZip();

			// %D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BA%D0%B0_1.png = "картинка_1.png"
			// %D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BA%D0%B0_2.png = "картинка_2.png"
			// %D0%BB%D0%BE%D0%B3%D0%BE.png = "лого.png"
			const xml = createPackageXml({
				logo: '@%D0%BB%D0%BE%D0%B3%D0%BE.png',
				questions: [
					{ isRef: true, type: 'image', value: 'картинка_1.png' },
					{ isRef: true, type: 'image', value: 'картинка_2.png' },
				],
			});

			zip.file('content.xml', xml);
			zip.file('Images/%D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BA%D0%B0_1.png', 'image-1-data');
			zip.file('Images/%D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BA%D0%B0_2.png', 'image-2-data');
			zip.file('Images/%D0%BB%D0%BE%D0%B3%D0%BE.png', 'logo-data');

			const file = await createTestPackageFile(zip);

			const store = createStoreWithExtra();
			await (store.dispatch as any)(openFile(file)).unwrap();

			// 1. Verify state right after openFile
			let state = store.getState().siquester;
			expect(state.pack?.logo).toBe('@лого.png');
			expect(state.zip?.file('Images/лого.png')).not.toBeNull();
			expect(state.zip?.file('Images/картинка_1.png')).not.toBeNull();
			expect(state.zip?.file('Images/картинка_2.png')).not.toBeNull();

			// 2. User deletes Question 2 (making картинка_2.png orphaned)
			store.dispatch(removeQuestion({ roundIndex: 0, themeIndex: 0, questionIndex: 1 }));

			// 3. User saves package
			await store.dispatch(savePackage() as any);

			state = store.getState().siquester;

			// 4. Verify resulting ZIP:
			// Active media and logo must remain with clean Cyrillic names
			expect(state.zip?.file('Images/картинка_1.png')).not.toBeNull();
			expect(state.zip?.file('Images/лого.png')).not.toBeNull();

			// Orphaned media from deleted question must be completely removed
			expect(state.zip?.file('Images/картинка_2.png')).toBeNull();

			// No files with '%' in their name should exist in the archive
			const allFiles = Object.keys((state.zip as any).files);
			const percentEncodedFiles = allFiles.filter(path => path.includes('%'));
			expect(percentEncodedFiles).toEqual([]);
		});
	});
});
