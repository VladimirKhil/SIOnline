import JSZip from 'jszip';
import React from 'react';
import { useAppSelector } from '../../../state/hooks';

import './MediaItem.scss';

interface MediaItemProps {
	src: string;
	type: 'image' | 'audio' | 'video';
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

			default:
				return '';
		}
	}

	async function loadItem(file: JSZip) {
		const sourceFolder = getSourceFolderName();
		const data = file.file(sourceFolder + '/' + src);
		const base64 = await data?.async('base64');

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
		if (zip && isRef) {
			loadItem(zip);
		}
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

			default:
				return null;
		}
	}

	return null;
};

export default MediaItem;
