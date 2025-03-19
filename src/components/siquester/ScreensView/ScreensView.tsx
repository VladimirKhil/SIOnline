import React from 'react';
import { ContentItem, ContentParam } from '../../../model/siquester/package';
import MediaItem from '../MediaItem/MediaItem';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';

import './ScreensView.scss';

interface ScreensViewProps {
	content: ContentParam
}

interface Screen {
	items: ContentItem[];
	background?: ContentItem;
	replic?: ContentItem;
}

const ScreensView: React.FC<ScreensViewProps> = ({ content }) => {
	const [screenIndex, setScreenIndex] = React.useState(0);

	React.useEffect(() => {
		setScreenIndex(0);
	}, [content]);

	const screens: Screen[] = [];
	const items = [];
	let background: ContentItem | undefined = undefined;
	let replic: ContentItem | undefined = undefined;

	for (let i = 0; i < content.items.length; i++) {
		const contentItem = content.items[i];

		switch (contentItem.placement) {
			case 'background':
				background = contentItem;
				break;

			case 'replic':
				replic = contentItem;
				break;

			default:
				items.push(contentItem);
				break;
		}

		if (contentItem.waitForFinish) {
			const screen: Screen = { items: [...items] };

			if (background) {
				screen.background = background;
				background = undefined;
			}

			if (replic) {
				screen.replic = replic;
				replic = undefined;
			}

			screens.push(screen);
			items.length = 0;
		}
	}

	if (items.length > 0 || background || replic) {
		const screen: Screen = { items: [...items] };

		if (background) {
			screen.background = background;
		}

		if (replic) {
			screen.replic = replic;
		}

		screens.push(screen);
	}

	const screen = screens[screenIndex];

	function getContentItem(contentItem: ContentItem): React.ReactNode {
		switch (contentItem.type) {
			case 'text': return <AutoSizedText maxFontSize={20}>{contentItem.value}</AutoSizedText>;
			case 'image': return <MediaItem src={contentItem.value} type='image' isRef={contentItem.isRef} />;
			case 'audio': return <MediaItem src={contentItem.value} type='audio' isRef={contentItem.isRef} />;
			case 'video': return <MediaItem src={contentItem.value} type='video' isRef={contentItem.isRef} />;
			case 'html': return <MediaItem src={contentItem.value} type='html' isRef={contentItem.isRef} />;
			default: return null;
		}
	}

	return (
		<>
			{screens.length > 1 ? <div className='packageView__question__screens'>
				{screens.map((_, si) => (
					<div
						className={`packageView__question__screen ${screenIndex === si ? 'selected' : ''}`}
						key={si}
						onClick={() => setScreenIndex(si)}>
						{si + 1}
					</div>
				))}
			</div> : null}

			{screen
				? <>
					{screen.items.length > 0 ?<div className='packageView__question__current__screen'>
						{screen.items.map((contentItem, ci) => <div
							className='packageView__question__content__item__host'
							key={contentItem.value}>
								{getContentItem(contentItem)}
							</div>)}
					</div> : null}

					{screen.background ? <div className='packageView__question__background'>
						{getContentItem(screen.background)}
					</div> : null}

					{screen.replic ? <div className='packageView__question__replic'>
						{getContentItem(screen.replic)}
					</div> : null}
				</>
				: null}
		</>
	);
};

export default ScreensView;