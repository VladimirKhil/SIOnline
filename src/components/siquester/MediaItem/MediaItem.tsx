import JSZip from 'jszip';
import React from 'react';
import { useAppSelector } from '../../../state/hooks';

import './MediaItem.scss';

interface MediaItemProps {
	src: string;
	type: 'image' | 'audio' | 'video' | 'html';
	isRef: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({ src, type, isRef }) => {
	const siquester = useAppSelector(state => state.siquester);
	const { zip } = siquester;
	const [item, setItem] = React.useState<string | undefined>(undefined);

	function getMimeType(filename: string, mediaType: 'image' | 'audio' | 'video' | 'html'): string {
		const ext = filename.toLowerCase().split('.').pop() || '';

		if (mediaType === 'image') {
			const imageTypes: Record<string, string> = {
				'png': 'image/png',
				'jpg': 'image/jpeg',
				'jpeg': 'image/jpeg',
				'gif': 'image/gif',
				'webp': 'image/webp',
				'svg': 'image/svg+xml',
				'bmp': 'image/bmp'
			};
			return imageTypes[ext] || 'image/png';
		}

		if (mediaType === 'audio') {
			const audioTypes: Record<string, string> = {
				'mp3': 'audio/mpeg',
				'wav': 'audio/wav',
				'ogg': 'audio/ogg',
				'm4a': 'audio/mp4',
				'aac': 'audio/aac',
				'flac': 'audio/flac'
			};
			return audioTypes[ext] || 'audio/mpeg';
		}

		if (mediaType === 'video') {
			const videoTypes: Record<string, string> = {
				'mp4': 'video/mp4',
				'webm': 'video/webm',
				'ogg': 'video/ogg',
				'avi': 'video/x-msvideo',
				'mov': 'video/quicktime',
				'wmv': 'video/x-ms-wmv'
			};
			return videoTypes[ext] || 'video/mp4';
		}

		return '';
	}

	function getSourceFolderName() {
		switch (type) {
			case 'image':
				return 'Images';

			case 'audio':
				return 'Audio';

			case 'video':
				return 'Video';

			case 'html':
				return 'Html';

			default:
				return '';
		}
	}

	async function loadItem(file: JSZip, isMounted: React.MutableRefObject<boolean>) {
		const sourceFolder = getSourceFolderName();
		// src is already encoded from the ZIP file path, so don't encode again
		const data = file.file(sourceFolder + '/' + src);

		if (!data) {
			return;
		}

		if (type === 'html') {
			const html = await data.async('text');

			if (!isMounted.current) {
				return;
			}

			setItem(html);
			return;
		}

		const base64 = await data.async('base64');

		if (!isMounted.current) {
			return;
		}

		const mimeType = getMimeType(src, type);
		setItem(`data:${mimeType};base64,${base64}`);
	}

	React.useEffect(() => {
		const isMounted = { current: true };

		if (zip && isRef) {
			loadItem(zip, isMounted);
		}

		return () => {
			isMounted.current = false;
		};
	}, [zip, src, type, isRef]);

	const source = isRef ? item : src;

	if (source) {
		switch (type) {
			case 'image':
				return <img src={source} alt='Media' className='packageView__question__content__item' />;

			case 'audio':
				return <audio src={source} controls className='packageView__question__content__item packageView__question__content__item--audio' />;

			case 'video':
				return <video src={source} controls className='packageView__question__content__item' />;

		case 'html':
			return isRef
				? <iframe
					srcDoc={source}
					title='HTML content'
					className='packageView__question__content__item'
					sandbox='allow-scripts allow-same-origin'
					scrolling='no'
				/>
				: <iframe
					src={source}
					title='HTML content'
					className='packageView__question__content__item'
					sandbox='allow-scripts allow-same-origin'
					scrolling='no'
				/>;			default:
				return null;
		}
	}

	return null;
};

export default MediaItem;
