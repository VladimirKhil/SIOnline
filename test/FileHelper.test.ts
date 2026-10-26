import { sanitizeFilename } from '../src/utils/FileHelper';

describe('FileHelper', () => {
	describe('sanitizeFilename', () => {
        describe('empty and blank inputs', () => {
			test('returns "untitled" for empty string or nullish values', () => {
				expect(sanitizeFilename('')).toBe('untitled');
				expect(sanitizeFilename(null as unknown as string)).toBe('untitled');
				expect(sanitizeFilename(undefined as unknown as string)).toBe('untitled');
			});

			test('returns "untitled" for strings consisting only of spaces', () => {
				expect(sanitizeFilename('   ')).toBe('untitled');
			});

			test('returns "untitled" for strings consisting only of dots and spaces', () => {
				expect(sanitizeFilename('.')).toBe('untitled');
				expect(sanitizeFilename('...')).toBe('untitled');
				expect(sanitizeFilename('. . .')).toBe('untitled');
			});
		});

		describe('invalid and control characters replacement', () => {
			test('replaces invalid Windows and Linux filename characters with underscores', () => {
				// Characters: < > : " / \ | ? *
				expect(sanitizeFilename('file<name>.png')).toBe('file_name_.png');
				expect(sanitizeFilename('track:1?*.mp3')).toBe('track_1__.mp3');
				expect(sanitizeFilename('a/b\\c|d"e.jpg')).toBe('a_b_c_d_e.jpg');
			});

			test('replaces C0 control characters (0-31, including tab and newline) and DEL (127)', () => {
				// \x00 (NUL), \x1F (Unit Separator), \x7F (DEL)
				expect(sanitizeFilename('hello\x00world\x1F.txt')).toBe('hello_world_.txt');
				expect(sanitizeFilename('delete\x7Fcharacter.png')).toBe('delete_character.png');
				// Tabs and newlines are C0 controls, so they are sanitized to underscores
				expect(sanitizeFilename('my\tfile\nname.png')).toBe('my_file_name.png');
				expect(sanitizeFilename('\t\n')).toBe('__');
			});

			test('replaces C1 control characters (128-159)', () => {
				// \u0080 through \u009F
				expect(sanitizeFilename('test\u0085newline.mp3')).toBe('test_newline.mp3');
				expect(sanitizeFilename('c1\u0090control.jpg')).toBe('c1_control.jpg');
			});
		});

		describe('whitespace collapsing and trimming', () => {
			test('collapses consecutive whitespace characters into a single space', () => {
				expect(sanitizeFilename('my    cool    image.png')).toBe('my cool image.png');
			});

			test('trims leading and trailing whitespace from the filename', () => {
				expect(sanitizeFilename('   padded_filename.png   ')).toBe('padded_filename.png');
			});
		});

		describe('stem, extension and trailing dots/spaces handling', () => {
			test('preserves standard filename and extension', () => {
				expect(sanitizeFilename('regular_photo.jpeg')).toBe('regular_photo.jpeg');
				expect(sanitizeFilename('audio_track.mp3')).toBe('audio_track.mp3');
			});

			test('preserves files without extension', () => {
				expect(sanitizeFilename('README')).toBe('README');
				expect(sanitizeFilename('LICENSE')).toBe('LICENSE');
			});

			test('correctly handles files with multiple dots', () => {
				expect(sanitizeFilename('archive.tar.gz')).toBe('archive.tar.gz');
				expect(sanitizeFilename('my.photo.final.v2.png')).toBe('my.photo.final.v2.png');
			});

			test('preserves hidden files starting with a dot', () => {
				expect(sanitizeFilename('.gitignore')).toBe('.gitignore');
			});

			test('strips invalid trailing dots and spaces from stem and extension', () => {
				expect(sanitizeFilename('filename. ')).toBe('filename');
				expect(sanitizeFilename('filename...txt')).toBe('filename.txt');
				expect(sanitizeFilename('photo.png...   ')).toBe('photo.png');
			});
		});

		describe('reserved Windows device names', () => {
			test('appends underscore to standard reserved names (case-insensitive)', () => {
				expect(sanitizeFilename('CON.txt')).toBe('CON_.txt');
				expect(sanitizeFilename('con.png')).toBe('con_.png');
				expect(sanitizeFilename('PRN.pdf')).toBe('PRN_.pdf');
				expect(sanitizeFilename('aux')).toBe('aux_');
				expect(sanitizeFilename('NUL.dat')).toBe('NUL_.dat');
				expect(sanitizeFilename('CONIN$.txt')).toBe('CONIN$_.txt');
				expect(sanitizeFilename('conout$.log')).toBe('conout$_.log');
			});

			test('appends underscore to COM0-COM9 and LPT0-LPT9 devices', () => {
				expect(sanitizeFilename('COM1.png')).toBe('COM1_.png');
				expect(sanitizeFilename('com5.txt')).toBe('com5_.txt');
				expect(sanitizeFilename('LPT3.mp3')).toBe('LPT3_.mp3');
				expect(sanitizeFilename('lpt9')).toBe('lpt9_');
			});

			test('detects reserved device names with superscript numbers via NFKD normalization', () => {
				// COM¹ (U+00B9) normalizes to COM1
				expect(sanitizeFilename('COM¹.txt')).toBe('COM¹_.txt');
				// LPT² (U+00B2) normalizes to LPT2
				expect(sanitizeFilename('lpt².png')).toBe('lpt²_.png');
				// COM³ (U+00B3) normalizes to COM3
				expect(sanitizeFilename('COM³')).toBe('COM³_');
			});

			test('does not mutate names that only start with a reserved word but are longer', () => {
				expect(sanitizeFilename('CONTACT.txt')).toBe('CONTACT.txt');
				expect(sanitizeFilename('PRINTER.png')).toBe('PRINTER.png');
				expect(sanitizeFilename('AUXILIARY.mp3')).toBe('AUXILIARY.mp3');
			});
		});
	});
});