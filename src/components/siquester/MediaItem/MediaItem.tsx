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
	const { zip, pack } = siquester;
	const [item, setItem] = React.useState<string | undefined>(undefined);

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
		const data = file.file(sourceFolder + '/' + encodeURIComponent(src));

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

		switch (type) {
			case 'image':
				setItem(`data:image/png;base64,${base64}`);
				break;

			case 'audio':
				setItem(`data:audio/mp3;base64,${base64}`);
				break;

			case 'video':
				setItem(`data:video/mp4;base64,${base64}`);
				break;

			default:
				break;
		}
	}

	React.useEffect(() => {
		const isMounted = { current: true };

		if (zip && isRef) {
			loadItem(zip, isMounted);
		}

		return () => {
			isMounted.current = false;
		};
	}, [pack]);

	const source = isRef ? item : src;

	if (source) {
		switch (type) {
			case 'image':
				return <img src={source} alt='Media' className='packageView__question__content__item' />;

			case 'audio':
				return <audio src={source} controls className='packageView__question__content__item' />;

			case 'video':
				return <video src={source} controls className='packageView__question__content__item' />;

			case 'html':
				return isRef
					? <iframe
						srcDoc={source}
						title='HTML content'
						className='packageView__question__content__item'
						sandbox='allow-scripts allow-same-origin'
					/>
					: <iframe
						src={source}
						title='HTML content'
						className='packageView__question__content__item'
						sandbox='allow-scripts allow-same-origin'
					/>;

			default:
				return null;
		}
	}

	return null;
};

export default MediaItem;
