import React from 'react';
import { ContentItem, ContentParam } from '../../../model/siquester/package';
import MediaItem from '../MediaItem/MediaItem';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';
import Constants from '../../../model/enums/Constants';

import './ScreensView.scss';

interface ScreensViewProps {
	content: ContentParam,
}

interface ContentGroup {
	content: ContentItem[];
	weight: number;
	columnCount: number;
}

interface Screen {
	duration?: number;
	groups: ContentGroup[];
	background?: ContentItem;
	replic?: ContentItem;
}

function timeStringToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
}

function initGroup(group: ContentGroup) {
	let bestRowCount = 1;
	let bestColumnCount = group.content.length / bestRowCount;
	let bestItemSize = Math.min(9.0 / bestRowCount, 16.0 / bestColumnCount);

	for	(let rowCount = 2; rowCount < group.content.length; rowCount++) {
		const columnCount = Math.ceil(group.content.length / rowCount);
		const itemSize = Math.min(9.0 / rowCount, 16.0 / columnCount);

		if (itemSize > bestItemSize) {
			bestItemSize = itemSize;
			bestRowCount = rowCount;
			bestColumnCount = columnCount;
		}
	}

	group.columnCount = bestColumnCount;
	group.weight *= bestRowCount;
}

const ScreensView: React.FC<ScreensViewProps> = ({ content }) => {
	const [screenIndex, setScreenIndex] = React.useState(0);

	React.useEffect(() => {
		setScreenIndex(0);
	}, [content]);

	const screens: Screen[] = [];
	const groups: ContentGroup[] = [];
	let group: ContentGroup | undefined = undefined;
	let background: ContentItem | undefined = undefined;
	let replic: ContentItem | undefined = undefined;
	let backgroundDuration = 0;
	let replicDuration = 0;
	let duration = 0;

	for (let i = 0; i < content.items.length; i++) {
		const contentItem = content.items[i];
		const contentDuration = contentItem.duration ? timeStringToSeconds(contentItem.duration) : 0;

		switch (contentItem.placement) {
			case 'background':
				background = contentItem;
				backgroundDuration = Math.max(backgroundDuration, contentDuration);
				break;

			case 'replic':
				replic = contentItem;
				replicDuration = Math.max(replicDuration, contentDuration);
				break;

			default: // TODO: unify with ClientController.onScreenContent() in the future
				switch (contentItem.type) {
					case 'text':
						if (group) {
							groups.push(group);
							initGroup(group);
							group = undefined;
						}

						const textWeight = Math.min(Constants.LARGE_CONTENT_WEIGHT, Math.max(1, contentItem.value.length / 80));
						const textGroup : ContentGroup = { content: [contentItem], weight: textWeight, columnCount: 1 };
						groups.push(textGroup);
						break;

					default:
						if (!group) {
							group = { content: [], weight: Constants.LARGE_CONTENT_WEIGHT, columnCount: 1 };
						}

						group.content.push(contentItem);
						break;
				}

				duration += contentDuration;
				break;
		}

		if (contentItem.waitForFinish) {
			if (group) {
				groups.push(group);
				initGroup(group);
				group = undefined;
			}

			const screen: Screen = { groups: [...groups] };

			if (background) {
				screen.background = background;
				background = undefined;
			}

			if (replic) {
				screen.replic = replic;
				replic = undefined;
			}

			const screenDuration = Math.max(backgroundDuration, replicDuration, duration);

			if (screenDuration > 0) {
				screen.duration = screenDuration;
				duration = 0;
				backgroundDuration = 0;
				replicDuration = 0;
			}

			screens.push(screen);
			groups.length = 0;
		}
	}

	if (groups.length > 0 || background || replic) {
		const screen: Screen = { groups: [...groups] };

		if (background) {
			screen.background = background;
		}

		if (replic) {
			screen.replic = replic;
		}

		const screenDuration = Math.max(backgroundDuration, replicDuration, duration);

		if (screenDuration > 0) {
			screen.duration = duration;
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
					{screen.duration ? <div className='packageView__question__duration'>
						<div className='packageView__question__duration__item'>
							<label htmlFor='duration' className='header'>{localization.screenDuration}</label>
							<input id='duration' type='text' value={screen.duration} readOnly />
						</div>
					</div> : null}

					{screen.groups.length > 0 ? <div className='packageView__question__current__screen'>
						{screen.groups.map((group, gi) => <div
							className='packageView__question__content__item__group'
							key={gi}
							style={{ flex: `${group.weight}`, gridTemplateColumns: `repeat(${group.columnCount}, 1fr)` }}>
								{group.content.map((contentItem, ci) => <div
									className='packageView__question__content__item'
									key={contentItem.value}>
										{getContentItem(contentItem)}
									</div>)}
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