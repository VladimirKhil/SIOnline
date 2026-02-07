import React from 'react';
import { ContentItem, ContentParam } from '../../../model/siquester/package';
import MediaItem from '../MediaItem/MediaItem';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';
import Constants from '../../../model/enums/Constants';
import { useDispatch } from 'react-redux';
import { updateContentItem } from '../../../state/siquesterSlice';

import './ScreensView.scss';

interface ScreensViewProps {
	content: ContentParam;
	isEditMode?: boolean;
	roundIndex?: number;
	themeIndex?: number;
	questionIndex?: number;
	paramName?: string;
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

const ScreensView: React.FC<ScreensViewProps> = ({ 
	content, 
	isEditMode = false, 
	roundIndex, 
	themeIndex, 
	questionIndex, 
	paramName 
}) => {
	const dispatch = useDispatch();
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

	const findContentItemIndex = (targetItem: ContentItem): number => content.items.findIndex(item => item === targetItem);

	function getContentItem(contentItem: ContentItem, itemIndex: number): React.ReactNode {
		const handleContentChange = (property: 'value', value: string) => {
			if (isEditMode && 
				typeof roundIndex === 'number' && 
				typeof themeIndex === 'number' && 
				typeof questionIndex === 'number' && 
				paramName) {
				dispatch(updateContentItem({
					roundIndex,
					themeIndex,
					questionIndex,
					paramName,
					itemIndex,
					property,
					value
				}));
			}
		};

		// For internal refs (when isRef is true), encode the URI to find the correct file in the ZIP package
		// For external URLs (when isRef is false), use as-is
		const getMediaSrc = (value: string, isRef: boolean): string => {
			if (isRef) {
				// Internal ZIP reference - encode to match file paths in ZIP
				return encodeURIComponent(value);
			}

			// External URL - use as-is
			return value;
		};

		switch (contentItem.type) {
			case 'text':
				return isEditMode ? (
					<textarea
						className='screensView__editable__text'
						value={contentItem.value}
						placeholder={localization.enterTextContent}
						aria-label="Edit text content"
						onChange={(e) => handleContentChange('value', e.target.value)}
					/>
				) : (
					<AutoSizedText maxFontSize={20}>{contentItem.value}</AutoSizedText>
				);
			case 'image': return <MediaItem src={getMediaSrc(contentItem.value, contentItem.isRef)} type='image' isRef={contentItem.isRef} />;
			case 'audio': return <MediaItem src={getMediaSrc(contentItem.value, contentItem.isRef)} type='audio' isRef={contentItem.isRef} />;
			case 'video': return <MediaItem src={getMediaSrc(contentItem.value, contentItem.isRef)} type='video' isRef={contentItem.isRef} />;
			case 'html': return <MediaItem src={getMediaSrc(contentItem.value, contentItem.isRef)} type='html' isRef={contentItem.isRef} />;
			default: return null;
		}
	}

	return (
		<>
			{(screens.length > 1 || isEditMode) ? <div className='packageView__question__screens'>
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

					{isEditMode ? (
						// Simple vertical list view in edit mode
						<div className='packageView__question__content__list'>
							{screen.groups.map((screenGroup, gi) => 
								screenGroup.content.map((contentItem, ci) => {
									const globalIndex = content.items.findIndex(item => item === contentItem);
									return (
										<div className='packageView__question__content__list__item' key={`${gi}-${ci}`}>
											{getContentItem(contentItem, globalIndex)}
										</div>
									);
								})
							)}
							{screen.background && (
								<div className='packageView__question__content__list__item'>
									<label className='header'>Background</label>
									{getContentItem(screen.background, findContentItemIndex(screen.background))}
								</div>
							)}
							{screen.replic && (
								<div className='packageView__question__content__list__item'>
									<label className='header'>Replic</label>
									{getContentItem(screen.replic, findContentItemIndex(screen.replic))}
								</div>
							)}
						</div>
					) : (
						// Original grid layout for view mode
						<>
							{screen.groups.length > 0 ? <div className='packageView__question__current__screen'>
								{screen.groups.map((screenGroup, gi) => <div
									className='packageView__question__content__item__group'
									key={gi}
									style={{
										flex: screenGroup.weight,
										gridTemplateColumns: `repeat(${screenGroup.columnCount}, 1fr)`
									}}>
										{screenGroup.content.map((contentItem, ci) => {
											const globalIndex = content.items.findIndex(item => item === contentItem);
											return (
												<div
													className='packageView__question__content__item'
													key={`${gi}-${ci}`}>
													{getContentItem(contentItem, globalIndex)}
												</div>
											);
										})}
									</div>)}
							</div> : null}

							{screen.background ? <div className='packageView__question__background'>
								{getContentItem(screen.background, findContentItemIndex(screen.background))}
							</div> : null}

							{screen.replic ? <div className='packageView__question__replic'>
								{getContentItem(screen.replic, findContentItemIndex(screen.replic))}
							</div> : null}
						</>
					)}
				</>
				: null}
		</>
	);
};

export default ScreensView;