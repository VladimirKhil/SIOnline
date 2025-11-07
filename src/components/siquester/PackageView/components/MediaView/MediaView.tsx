import React from 'react';
import JSZip from 'jszip';
import MediaItem from '../../../MediaItem/MediaItem';
import localization from '../../../../../model/resources/localization';

import './MediaView.scss';

interface MediaViewProps {
	zip: JSZip;
}

interface MediaFile {
	name: string;
	type: 'image' | 'audio' | 'video' | 'html';
	path: string;
}

type MediaTab = 'images' | 'audio' | 'video' | 'html';

const MediaView: React.FC<MediaViewProps> = ({ zip }) => {
	const [activeTab, setActiveTab] = React.useState<MediaTab>('images');
	const [mediaFiles, setMediaFiles] = React.useState<Record<MediaTab, MediaFile[]>>({
		images: [],
		audio: [],
		video: [],
		html: []
	});
	const [loading, setLoading] = React.useState(true);

	const loadMediaFiles = async () => {
		setLoading(true);
		
		const files: Record<MediaTab, MediaFile[]> = {
			images: [],
			audio: [],
			video: [],
			html: []
		};

		// Scan all files in the zip
		zip.forEach((relativePath, file) => {
			if (file.dir) return; // Skip directories

			// Check if file is in one of the media folders
			if (relativePath.startsWith('Images/')) {
				const fileName = relativePath.substring('Images/'.length);
				if (fileName) {
					files.images.push({
						name: decodeURIComponent(fileName),
						type: 'image',
						path: fileName
					});
				}
			} else if (relativePath.startsWith('Audio/')) {
				const fileName = relativePath.substring('Audio/'.length);
				if (fileName) {
					files.audio.push({
						name: decodeURIComponent(fileName),
						type: 'audio',
						path: fileName
					});
				}
			} else if (relativePath.startsWith('Video/')) {
				const fileName = relativePath.substring('Video/'.length);
				if (fileName) {
					files.video.push({
						name: decodeURIComponent(fileName),
						type: 'video',
						path: fileName
					});
				}
			} else if (relativePath.startsWith('Html/')) {
				const fileName = relativePath.substring('Html/'.length);
				if (fileName) {
					files.html.push({
						name: decodeURIComponent(fileName),
						type: 'html',
						path: fileName
					});
				}
			}
		});

		// Sort files by name
		Object.keys(files).forEach(key => {
			files[key as MediaTab].sort((a, b) => a.name.localeCompare(b.name));
		});

		setMediaFiles(files);
		setLoading(false);
	};

	React.useEffect(() => {
		loadMediaFiles();
	}, [zip]);

	const getTabLabel = (tab: MediaTab, count: number): string => {
		switch (tab) {
			case 'images':
				return `${localization.images} (${count})`;
			case 'audio':
				return `${localization.audio} (${count})`;
			case 'video':
				return `${localization.video} (${count})`;
			case 'html':
				return `HTML (${count})`;
			default:
				return `${tab} (${count})`;
		}
	};

	if (loading) {
		return <div className="mediaView__loading">Loading media files...</div>;
	}

	const currentFiles = mediaFiles[activeTab];

	return (
		<div className="mediaView">
			<div className="packageView__rounds">
				<div
					className={`packageView__round ${activeTab === 'images' ? 'selected' : ''}`}
					onClick={() => setActiveTab('images')}
				>
					{getTabLabel('images', mediaFiles.images.length)}
				</div>
				<div
					className={`packageView__round ${activeTab === 'audio' ? 'selected' : ''}`}
					onClick={() => setActiveTab('audio')}
				>
					{getTabLabel('audio', mediaFiles.audio.length)}
				</div>
				<div
					className={`packageView__round ${activeTab === 'video' ? 'selected' : ''}`}
					onClick={() => setActiveTab('video')}
				>
					{getTabLabel('video', mediaFiles.video.length)}
				</div>
				<div
					className={`packageView__round ${activeTab === 'html' ? 'selected' : ''}`}
					onClick={() => setActiveTab('html')}
				>
					{getTabLabel('html', mediaFiles.html.length)}
				</div>
			</div>

			<div className="mediaView__content">
				{currentFiles.length === 0 ? (
					<div className="mediaView__empty">
						No {activeTab} files found in package
					</div>
				) : (
					<div className={`mediaView__grid mediaView__grid--${activeTab}`}>
						{currentFiles.map((file, index) => (
							<div key={index} className="mediaView__item">
								<div className="mediaView__item__name">
									{file.name}
								</div>
								<div className="mediaView__item__content">
									<MediaItem
										src={file.path}
										type={file.type}
										isRef={true}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default MediaView;